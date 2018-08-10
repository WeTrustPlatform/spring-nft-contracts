pragma solidity ^0.4.23;

import './NFToken.sol';

contract SpringNFT is NFToken{


    modifier recipientExists(bytes32 id) {
        require(recipients[id].exists);
        _;
    }

    modifier recipientDoesNotExists(bytes32 id) {
        require(!recipients[id].exists);
        _;
    }

    modifier onlyByWeTrust() {
        require(msg.sender == wetrustAddress);
        _;
    }

    modifier onlyByWeTrustOrRecipient(bytes32 id) {
        require(msg.sender == wetrustAddress || msg.sender == recipients[id].owner);
        _;
    }

    address wetrustAddress;
    mapping(bytes32 => Recipient) public recipients;
    mapping(bytes32 => Update[]) public recipientUpdates;
    mapping(bytes32 => bool) public redeemedToken;

    mapping (uint256 => bytes) public nftArtistSignature;

    struct Update {
        string url;
        uint256 createdAt;
    }

    struct Recipient {
        string name;
        string url;
        address owner;
        uint256 nftCount;
        bool exists;
    }

    constructor (address WeTrust) NFToken() public {
        wetrustAddress = WeTrust;
    }

    function createNFT(address receiver, bytes32 recipientId, bytes32 traits, bytes4 nftType) onlyByWeTrust public returns (uint256 tokenId) {
        return mint(receiver, recipientId, traits, nftType);
    }

    // each message must be in the following format
    // address receiver , although address is 20 bytes, it is stored in 32 bytes
    // bytes32 recipientId
    // bytes32 trait
    // bytes4 nftType
    function batchCreate(bytes nftparams) onlyByWeTrust public returns (bool success) {
        uint256 numOfNFT = nftparams.length / 100;

        address receiver;
        bytes32 recipientId;
        bytes32 traits;
        bytes4 nftType;

        for (uint256 pos = 0; pos < numOfNFT; pos++) {
            assembly {
                receiver := mload(add(nftparams, add(32, mul(100,pos))))
                recipientId := mload(add(nftparams, add(64, mul(100,pos))))
                traits := mload(add(nftparams, add(96, mul(100,pos))))
                nftType := mload(add(nftparams, add(128, mul(100,pos))))
            }
            createNFT(receiver, recipientId, traits, nftType);
        }

        return true;
    }

    // message must be in the following format
    // bytes4 nftType
    // bytes32 traits
    // bytes32 recipientId
    // bytes32 uniqueToken
    // bytes signature
    function redeemToken(bytes signedMessage) public returns(uint256 tokenId) {
        bytes4 nftType;
        bytes32 traits;
        bytes32 recipientId;
        bytes32 uniqueToken;
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            nftType := mload(add(signedMessage, 32)) // first 32 bytes are data padding
            traits := mload(add(signedMessage, 36))
            recipientId := mload(add(signedMessage, 68))
            uniqueToken := mload(add(signedMessage, 100))
            r := mload(add(signedMessage, 132))
            s := mload(add(signedMessage, 164))
            v := mload(add(signedMessage, 196))
        }
        require(!redeemedToken[uniqueToken]);
        if (v < 27) {
            v += 27;
        }

        bytes32 msgHash = createRedeemMessageHash(nftType, traits, recipientId, uniqueToken);
        address signer = ecrecover(msgHash, v, r, s);

        require(signer == wetrustAddress);
        redeemedToken[uniqueToken] = true;
        return mint(msg.sender, recipientId, traits, nftType);
    }

    function addRecipient(bytes32 recipientId, string name, string url, address owner) recipientDoesNotExists(recipientId) onlyByWeTrust public {
        require(bytes(name).length > 0); // no empty string

        recipients[recipientId].name = name;
        recipients[recipientId].url = url;
        recipients[recipientId].owner = owner;
        recipients[recipientId].exists = true;
    }

    function addRecipientUpdate(bytes32 recipientId, string url) recipientExists(recipientId) onlyByWeTrustOrRecipient(recipientId) public {
        recipientUpdates[recipientId].push(Update(url, now));
    }

    function updateRecipientInfo(bytes32 recipientId, string name, string url, address owner) recipientExists(recipientId) onlyByWeTrust public {
        require(bytes(name).length > 0); // no empty string

        recipients[recipientId].name = name;
        recipients[recipientId].url = url;
        recipients[recipientId].owner = owner;
    }

    function addArtistSignature(uint256 nftId, bytes artistSignature) onlyByWeTrust public {
        require(nftArtistSignature[nftId].length == 0); // make sure no prior signature exists

        nftArtistSignature[nftId] = artistSignature;
    }

    function getUpdateCount(bytes32 recipientId) view public returns(uint256 count) {
        return recipientUpdates[recipientId].length;
    }

    function createRedeemMessageHash(bytes4 nftType, bytes32 traits, bytes32 recipientId, bytes32 uniqueToken) pure public returns(bytes32 msgHash) {
        return keccak256(
            abi.encodePacked(
                nftType,
                traits,
                recipientId,
                uniqueToken
            ));
    }

    //////////////////////////
    // Private Functions
    /////////////////////////

    function mint(address receiver, bytes32 recipientId, bytes32 traits, bytes4 nftType) recipientExists(recipientId) internal returns (uint256 tokenId) {
        nftCount++;

        nft[nftCount].owner = receiver;
        nft[nftCount].traits = traits;
        nft[nftCount].recipientId = recipientId;
        nft[nftCount].nftType = nftType;
        nft[nftCount].createdAt = now;
        nft[nftCount].edition = determineEdition(recipientId);

        recipients[recipientId].nftCount++;
        ownerToNFTokenCount[receiver]++;

        return nftCount;
    }

    // determine the edition using the following formula
    // f(x) = max( 100 + (300 (x -1), 5000)
    function determineEdition(bytes32 recipientId) view internal returns (uint16 edition) {
        uint256 nextNFTcount = recipients[recipientId].nftCount + 1;
        uint256 currentEditionSize = 100;
        uint256 cumulativeEditionSize = 100;
        uint16 currentEdition = 0;

        while (true) {
            if (nextNFTcount < cumulativeEditionSize) {
                return currentEdition;
            }

            if (currentEditionSize + 300 > 5000) {
                currentEditionSize = 5000;
            } else {
                currentEditionSize += 300;
            }

            cumulativeEditionSize += currentEditionSize;
            currentEdition++;
        }
    }
}
