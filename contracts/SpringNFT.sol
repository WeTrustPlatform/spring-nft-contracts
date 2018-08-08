pragma solidity ^0.4.0;

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

    struct Recipient {
        string name;
        string url;
        address owner;
        string[] updates;
        uint256 nftCount;
        bool exists;
    }

    constructor (address WeTrust) NFToken() public {
        wetrustAddress = WeTrust;
    }

    function createNFT(address receiver, bytes32 recipientId, bytes32 traits, bytes4 nftType) recipientExists(recipientId) onlyByWeTrust public returns (uint256 tokenId) {
        tokenId = nftCount + 1;

        nft[tokenId].owner = receiver;
        nft[tokenId].traits = traits;
        nft[tokenId].recipientId = recipientId;
        nft[tokenId].nftType = nftType;
        nft[tokenId].edition = determineEdition(recipientId);

        recipients[recipientId].nftCount++;
    }

    // each message must be in the following format
    // address receiver 20 bytes
    // bytes32 recipientId
    // bytes32 trait
    // bytes4 nftType
    function batchCreate(bytes nftparams) onlyByWeTrust public returns (bool success) {
        uint256 numOfNFT = nftparams.length / 88;

        address receiver;
        bytes32 recipientId;
        bytes32 traits;
        bytes4 nftType;

        for (uint256 pos = 0; pos < numOfNFT; pos++) {
            assembly {
                receiver := mload(add(nftparams, add(32, mul(88,pos))))
                recipientId := mload(add(nftparams, add(52, mul(88,pos))))
                traits := mload(add(nftparams, add(84, mul(88,pos))))
                nftType := mload(add(nftparams, add(116, mul(88,pos))))
            }
            createNFT(receiver, recipientId, traits, nftType);
        }

        return true;
    }

    // message must be in the following format
    // bytes4 nftType
    // bytes32 traits
    // bytes32 recipientId
    // bytes signature
    function redeemToken(bytes signedMessage) public {
        bytes4 nftType;
        bytes32 traits;
        bytes32 recipientId;
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            nftType := mload(add(signedMessage, 32)) // first 32 bytes are data padding
            traits := mload(add(signedMessage, 36))
            recipientId := mload(add(signedMessage, 68))
            r := mload(add(signedMessage, 100))
            s := mload(add(signedMessage, 132))
            v := mload(add(signedMessage, 164))
        }

        bytes32 msgHash = keccak256(
            abi.encodePacked(
                nftType,
                traits,
                recipientId));
        address signer = ecrecover(msgHash, v, r, s);

        require(signer == wetrustAddress);
        createNFT(msg.sender, recipientId, traits, nftType);
    }

    function addRecipient(bytes32 recipientId, string name, string url, address owner) recipientDoesNotExists(recipientId) onlyByWeTrust public {
        require(bytes(name).length > 0); // no empty string

        recipients[recipientId].name = name;
        recipients[recipientId].url = url;
        recipients[recipientId].owner = owner;
        recipients[recipientId].exists = true;
    }

    function addRecipientUpdate(bytes32 recipientId, string url) recipientExists(recipientId) onlyByWeTrustOrRecipient(recipientId) public {
        recipients[recipientId].updates.push(url);
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


    //////////////////////////
    // Private Functions
    /////////////////////////

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
