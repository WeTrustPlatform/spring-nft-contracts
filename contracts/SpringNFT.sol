pragma solidity ^0.4.23;

import "./NFToken.sol";

//@dev Implemention of NFT for WeTrust Spring
contract SpringNFT is NFToken{
    //////////////////////////////
    // Modifiers
    /////////////////////////////

    /**
     * @dev Guarrentees that recipient Exists
     * @param id receipientId to check
     */
    modifier recipientExists(bytes32 id) {
        require(recipients[id].exists, "Recipient Must exist");
        _;
    }

    /**
     * @dev Guarrentees that recipient does not Exists
     * @param id receipientId to check
     */
    modifier recipientDoesNotExists(bytes32 id) {
        require(!recipients[id].exists, "Recipient Must not exists");
        _;
    }

    /**
     * @dev Guarrentees that msg.sender is wetrust owned address
     */
    modifier onlyByWeTrust() {
        require(msg.sender == wetrustAddress, "sender must be from WeTrust Address");
        _;
    }

    /**
     * @dev Guarrentees that msg.sender is either wetrust recipient
     * @param id receipientId to check
     */
    modifier onlyByWeTrustOrRecipient(bytes32 id) {
        require(msg.sender == wetrustAddress || msg.sender == recipients[id].owner, "sender must be from WeTrust or Recipient's owner address");
        _;
    }

    /**
     * @dev Guarrentees that contract is not in paused state
     */
    modifier onlyWhenNotPaused() {
        require(!paused, "contract is currently in paused state");
        _;
    }

    //////////////////////////////
    // Storage Variables
    /////////////////////////////

    /**
     * @dev wetrust Controlled address
     */
    address wetrustAddress;

    /**
     * @dev if paused is true, suspend most of contract's functionality
     */
    bool paused;

    /**
     * @dev mapping of recipients from WeTrust Spring platform
     */
    mapping(bytes32 => Recipient) public recipients;
    /**
     * @dev mapping to a list of updates made by recipients
     */
    mapping(bytes32 => Update[]) public recipientUpdates;
    /**
     * @dev keeps tracks of uniqueToken during redeem process to avoid replay attack
     */
    mapping(bytes32 => bool) public redeemedToken;

    /**
     * @dev Stores the Artist signed Message who created the NFT
     */
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

    //////////////////////////////
    // Public functions
    /////////////////////////////

    /**
     * @dev contract constructor, sets msg.sender as wetrustAddress
     */
    constructor (address WeTrust) NFToken() public {
        wetrustAddress = WeTrust;
    }

    /**
     * @dev Create a new NFT
     * @param receiver the owner of the new NFT
     * @param recipientId The issuer of the NFT
     * @param traits NFT Traits
     * @param nftType Type of the NFT
     */

    function createNFT(
        address receiver,
        bytes32 recipientId,
        bytes32 traits,
        bytes4 nftType)
        onlyByWeTrust public returns (uint256 tokenId)
    {
        return mint(receiver, recipientId, traits, nftType);
    }

    /**
     * @dev Allow creation of multiple NFTs in one transaction
     * @param nftparams Parameters of NFTs to be created
     * Note: any number of NFTs can be created, assuming the following parameters for each individual NFT is given
     * - address receiver
     * - bytes32 recipientId
     * - bytes32 traits
     * - bytes4 nftType
     */
    function batchCreate(bytes nftparams) onlyByWeTrust onlyWhenNotPaused public returns (bool success) {
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

    /**
     * @dev Allows anyone to redeem a token by providing a signed Message from Spring platform
     * @param signedMessage A signed Message containing the NFT parameter from Spring platform
     * The Signed Message must be concatenated in the following format
     * - bytes4 nftType
     * - bytes32 traits
     * - bytes32 recipientId
     * - bytes32 uniqueToken
     * - bytes32 r of Signature
     * - bytes32 s of Signature
     * - uint8 v of Signature
     */
    function redeemToken(bytes signedMessage) onlyWhenNotPaused public returns(uint256 tokenId) {
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
        require(!redeemedToken[uniqueToken], "This token has been redeemed already");
        if (v < 27) {
            v += 27;
        }

        bytes32 msgHash = createRedeemMessageHash(nftType, traits, recipientId, uniqueToken);
        address signer = ecrecover(msgHash, v, r, s);

        require(signer == wetrustAddress, "WeTrust did not authorized this redeem script");
        redeemedToken[uniqueToken] = true;
        return mint(msg.sender, recipientId, traits, nftType);
    }

    /**
     * @dev Add a new reciepient of WeTrust Spring
     * @param recipientId Unique identifier of receipient
     * @param name of the Recipient
     * @param url link to the recipient's website
     * @param owner Address owned by the recipient
     */
    function addRecipient(bytes32 recipientId, string name, string url, address owner)
        onlyByWeTrust
        onlyWhenNotPaused
        recipientDoesNotExists(recipientId)
        public
    {
        require(bytes(name).length > 0, "name must not be empty string"); // no empty string

        recipients[recipientId].name = name;
        recipients[recipientId].url = url;
        recipients[recipientId].owner = owner;
        recipients[recipientId].exists = true;
    }

    /**
     * @dev Add an link to the update the recipient had made
     * @param recipientId The issuer of the update
     * @param url link to the update
     */
    function addRecipientUpdate(bytes32 recipientId, string url)
        onlyWhenNotPaused
        recipientExists(recipientId)
        onlyByWeTrustOrRecipient(recipientId)
        public
    {
        recipientUpdates[recipientId].push(Update(url, now));
    }

    /**
     * @dev Change recipient information
     * @param recipientId to change
     * @param name new name of the recipient
     * @param url new link of the recipient
     * @param owner new address owned by the recipient
     */
    function updateRecipientInfo(bytes32 recipientId, string name, string url, address owner)
        onlyByWeTrust
        onlyWhenNotPaused
        recipientExists(recipientId)
        public
    {
        require(bytes(name).length > 0, "name must not be empty string"); // no empty string

        recipients[recipientId].name = name;
        recipients[recipientId].url = url;
        recipients[recipientId].owner = owner;
    }

    /**
     * @dev add a artist signed message for a particular NFT
     * @param nftId NFT to add the signature to
     * @param artistSignature Artist Signed Message
     */
    function addArtistSignature(uint256 nftId, bytes artistSignature) onlyByWeTrust onlyWhenNotPaused public {
        require(nftArtistSignature[nftId].length == 0, "Artist Signature already exist for this token"); // make sure no prior signature exists

        nftArtistSignature[nftId] = artistSignature;
    }

    /**
     * @dev Set whether or not the contract is paused
     * @param _paused status to put the contract in
     */
    function setPaused(bool _paused) onlyByWeTrust public {
        paused = _paused;
    }

    /**
     * @dev Returns the number of updates recipients had made
     * @param recipientId receipientId to check
     */
    function getUpdateCount(bytes32 recipientId) view public returns(uint256 count) {
        return recipientUpdates[recipientId].length;
    }

    /**
     * @dev returns the message hash to be signed for redeem token
     * @param nftType Type of NFT to be created
     * @param traits Traits of NFT to be created
     * @param recipientId Issuer of the NFT
     * @param uniqueToken Unique string to avoid using the same message to create multiple NFT
     */
    function createRedeemMessageHash(
        bytes4 nftType,
        bytes32 traits,
        bytes32 recipientId,
        bytes32 uniqueToken)
        pure public returns(bytes32 msgHash)
    {
        return keccak256(
            abi.encodePacked(
                nftType,
                traits,
                recipientId,
                uniqueToken
            ));
    }

    /**
     * @dev Determines the edition of the NFT
     *      formula used to determine edition:
     *      f(x) = max(100 + (300 * (x-1)), 5000)
     * @param nextNFTcount to determine edition for
     */
    function determineEdition(uint256 nextNFTcount) pure public returns (uint16 edition) {
        uint256 currentEditionSize = 100;
        uint256 cumulativeEditionSize = 100;

        while (true) {
            if (nextNFTcount <= cumulativeEditionSize) {
                return edition;
            }

            if (currentEditionSize + 300 >= 5000) {
                currentEditionSize = 5000;
            } else {
                currentEditionSize += 300;
            }

            cumulativeEditionSize += currentEditionSize;
            edition++;
        }
    }

    //////////////////////////
    // Private Functions
    /////////////////////////

    /**
     * @dev Add the new NFT to the storage
     * @param receiver the owner of the new NFT
     * @param recipientId The issuer of the NFT
     * @param traits NFT Traits
     * @param nftType Type of the NFT
     */
    function mint(address receiver, bytes32 recipientId, bytes32 traits, bytes4 nftType)
        recipientExists(recipientId)
        internal returns (uint256 tokenId)
    {
        nftCount++;

        nft[nftCount].owner = receiver;
        nft[nftCount].traits = traits;
        nft[nftCount].recipientId = recipientId;
        nft[nftCount].nftType = nftType;
        nft[nftCount].createdAt = now;
        nft[nftCount].edition = determineEdition(recipients[recipientId].nftCount + 1);

        recipients[recipientId].nftCount++;
        ownerToNFTokenCount[receiver]++;

        return nftCount;
    }
}
