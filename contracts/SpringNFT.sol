pragma solidity ^0.4.24;

import "./NFToken.sol";

//@dev Implemention of NFT for WeTrust Spring
contract SpringNFT is NFToken{


    //////////////////////////////
    // Events
    /////////////////////////////
    event RecipientUpdate(bytes32 indexed recipientId, bytes32 updateId);

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
     * @dev Guarrentees that msg.sender is wetrust owned signer address
     */
    modifier onlyByWeTrustSigner() {
        require(msg.sender == wetrustSigner, "sender must be from WeTrust Signer Address");
        _;
    }

    /**
     * @dev Guarrentees that msg.sender is wetrust owned manager address
     */
    modifier onlyByWeTrustManager() {
        require(msg.sender == wetrustManager, "sender must be from WeTrust Manager Address");
        _;
    }

    /**
     * @dev Guarrentees that msg.sender is either wetrust recipient
     * @param id receipientId to check
     */
    modifier onlyByWeTrustOrRecipient(bytes32 id) {
        require(msg.sender == wetrustSigner || msg.sender == recipients[id].owner, "sender must be from WeTrust or Recipient's owner address");
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
     * @dev wetrust controlled address that is used to create new NFTs
     */
    address public wetrustSigner;

    /**
     *@dev wetrust controlled address that is used to switch the signer address
     */
    address public wetrustManager;

    /**
     * @dev if paused is true, suspend most of contract's functionality
     */
    bool public paused;

    /**
     * @dev mapping of recipients from WeTrust Spring platform
     */
    mapping(bytes32 => Recipient) public recipients;
    /**
     * @dev mapping to a list of updates made by recipients
     */
    mapping(bytes32 => Update[]) public recipientUpdates;

    /**
     * @dev Stores the Artist signed Message who created the NFT
     */
    mapping (uint256 => bytes) public nftArtistSignature;

    struct Update {
        bytes32 id;
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
     * @dev contract constructor
     */
    constructor (address signer, address manager) NFToken() public {
        wetrustSigner = signer;
        wetrustManager = manager;
    }

    /**
     * @dev Create a new NFT
     * @param tokenId create new NFT with this tokenId
     * @param receiver the owner of the new NFT
     * @param recipientId The issuer of the NFT
     * @param traits NFT Traits
     * @param nftType Type of the NFT
     */

    function createNFT(
        uint256 tokenId,
        address receiver,
        bytes32 recipientId,
        bytes32 traits,
        bytes4 nftType)
        noOwnerExists(tokenId)
        onlyByWeTrustSigner
        onlyWhenNotPaused public
    {
        mint(tokenId, receiver, recipientId, traits, nftType);
    }

    /**
     * @dev Allow creation of multiple NFTs in one transaction
     * @param nftparams Parameters of NFTs to be created
     * Note: any number of NFTs can be created, assuming the following parameters for each individual NFT is given
     * - bytes32 tokenId
     * - address receiver
     * - bytes32 recipientId
     * - bytes32 traits
     * - bytes4 nftType
     */
    function batchCreate(bytes nftparams) onlyByWeTrustSigner onlyWhenNotPaused public returns (bool success) {
        uint256 numOfNFT = nftparams.length / 132;

        uint256 tokenId;
        address receiver;
        bytes32 recipientId;
        bytes32 traits;
        bytes4 nftType;

        for (uint256 pos = 0; pos < numOfNFT; pos++) {
            assembly {
                tokenId := mload(add(nftparams, add(32, mul(132,pos))))
                receiver := mload(add(nftparams, add(64, mul(132,pos))))
                recipientId := mload(add(nftparams, add(96, mul(132,pos))))
                traits := mload(add(nftparams, add(128, mul(132,pos))))
                nftType := mload(add(nftparams, add(160, mul(132,pos))))
            }
            createNFT(tokenId, receiver, recipientId, traits, nftType);
        }

        return true;
    }

    /**
     * @dev Allows anyone to redeem a token by providing a signed Message from Spring platform
     * @param signedMessage A signed Message containing the NFT parameter from Spring platform
     * The Signed Message must be concatenated in the following format
     * - address to (the smart contract address)
     * - uint256 tokenId
     * - bytes4 nftType
     * - bytes32 traits
     * - bytes32 recipientId
     * - bytes32 r of Signature
     * - bytes32 s of Signature
     * - uint8 v of Signature
     */
    function redeemToken(bytes signedMessage) onlyWhenNotPaused public {
        address to;
        uint256 tokenId;
        bytes4 nftType;
        bytes32 traits;
        bytes32 recipientId;
        bytes32 r;
        bytes32 s;
        byte vInByte;
        uint8 v;
        string memory prefix = "\x19Ethereum Signed Message:\n32";

        assembly {
            to := mload(add(signedMessage, 32))
            tokenId := mload(add(signedMessage, 64))
            nftType := mload(add(signedMessage, 96)) // first 32 bytes are data padding
            traits := mload(add(signedMessage, 100))
            recipientId := mload(add(signedMessage, 132))
            r := mload(add(signedMessage, 164))
            s := mload(add(signedMessage, 196))
            vInByte := mload(add(signedMessage, 228))
        }
        require(to == address(this), "This signed Message is not meant for this smart contract");
        v = uint8(vInByte);
        if (v < 27) {
            v += 27;
        }

        require(nft[tokenId].owner == address(0), "This token has been redeemed already");
        bytes32 msgHash = createRedeemMessageHash(tokenId, nftType, traits, recipientId);
        bytes32 preFixedMsgHash = keccak256(
            abi.encodePacked(
                prefix,
                msgHash
            ));

        address signer = ecrecover(preFixedMsgHash, v, r, s);

        require(signer == wetrustSigner, "WeTrust did not authorized this redeem script");
        return mint(tokenId, msg.sender, recipientId, traits, nftType);
    }

    /**
     * @dev Add a new reciepient of WeTrust Spring
     * @param recipientId Unique identifier of receipient
     * @param name of the Recipient
     * @param url link to the recipient's website
     * @param owner Address owned by the recipient
     */
    function addRecipient(bytes32 recipientId, string name, string url, address owner)
        onlyByWeTrustSigner
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
     * @param updateId unique id of the update
     */
    function addRecipientUpdate(bytes32 recipientId, bytes32 updateId)
        onlyWhenNotPaused
        recipientExists(recipientId)
        onlyByWeTrustOrRecipient(recipientId)
        public
    {
        recipientUpdates[recipientId].push(Update(updateId, now));
        emit RecipientUpdate(recipientId, updateId);
    }

    /**
     * @dev Change recipient information
     * @param recipientId to change
     * @param name new name of the recipient
     * @param url new link of the recipient
     * @param owner new address owned by the recipient
     */
    function updateRecipientInfo(bytes32 recipientId, string name, string url, address owner)
        onlyByWeTrustSigner
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
    function addArtistSignature(uint256 nftId, bytes artistSignature) onlyByWeTrustSigner onlyWhenNotPaused public {
        require(nftArtistSignature[nftId].length == 0, "Artist Signature already exist for this token"); // make sure no prior signature exists

        nftArtistSignature[nftId] = artistSignature;
    }

    /**
     * @dev Set whether or not the contract is paused
     * @param _paused status to put the contract in
     */
    function setPaused(bool _paused) onlyByWeTrustManager public {
        paused = _paused;
    }

    /**
     * @dev Transfer the WeTrust signer of NFT contract to a new address
     * @param newAddress new WeTrust owned address
     */
    function changeWeTrustSigner(address newAddress) onlyWhenNotPaused onlyByWeTrustManager public {
        wetrustSigner = newAddress;
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
     * @param tokenId id of the token to be created
     * @param nftType Type of NFT to be created
     * @param traits Traits of NFT to be created
     * @param recipientId Issuer of the NFT
     */
    function createRedeemMessageHash(
        uint256 tokenId,
        bytes4 nftType,
        bytes32 traits,
        bytes32 recipientId)
        view public returns(bytes32 msgHash)
    {
        return keccak256(
            abi.encodePacked(
                address(this),
                tokenId,
                nftType,
                traits,
                recipientId
            ));
    }

    /**
     * @dev Determines the edition of the NFT
     *      formula used to determine edition Size given the edition Number:
     *      f(x) = min(300x + 100, 5000)
     * using equation: g(x) = 150x^2 - 50x + 1 if x <= 16
     * else g(x) = 5000(x-16) - g(16)
     * maxEdition = 5000
     * @param nextNFTcount to determine edition for
     */
    function determineEdition(uint256 nextNFTcount) pure public returns (uint16 edition) {
        uint256 output;
        uint256 valueWhenXisSixteen = 37601; // g(16)
        if (nextNFTcount < valueWhenXisSixteen) {
            output = (sqrt(2500 + (600 * (nextNFTcount - 1))) + 50) / 300;
        } else {
            output = ((nextNFTcount - valueWhenXisSixteen) / 5000) + 16;
        }

        if (output > 5000) {
            output = 5000;
        }

        edition = uint16(output); // we don't have to worry about casting because output will always be less than or equal to 5000
    }

    /**
     * @dev set new host name for this nft contract
     * @param newHostName new host name to use
     */
    function setHostName(string newHostName) onlyByWeTrustManager external {
        hostname = newHostName;
    }

    /**
     * @dev set new Name of this NFT contract
     * @param newName new NFT name
     */
    function setName(string newName) onlyByWeTrustManager external {
        nftName = newName;
    }

    /**
     * @dev set new Symbol of this NFT contract
     * @param newSymbol new NFT symbol
     */
    function setSymbol(string newSymbol) onlyByWeTrustManager external {
        nftSymbol = newSymbol;
    }

    //////////////////////////
    // Private Functions
    /////////////////////////

    /**
     * @dev Find the Square root of a number
     * @param x input
     * Credit goes to: https://ethereum.stackexchange.com/questions/2910/can-i-square-root-in-solidity
     */

    function sqrt(uint x) pure internal returns (uint y) {
        uint z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    /**
     * @dev Add the new NFT to the storage
     * @param receiver the owner of the new NFT
     * @param recipientId The issuer of the NFT
     * @param traits NFT Traits
     * @param nftType Type of the NFT
     */
    function mint(uint256 tokenId, address receiver, bytes32 recipientId, bytes32 traits, bytes4 nftType)
        recipientExists(recipientId)
        internal
    {
        nft[tokenId].owner = receiver;
        nft[tokenId].traits = traits;
        nft[tokenId].recipientId = recipientId;
        nft[tokenId].nftType = nftType;
        nft[tokenId].createdAt = now;
        nft[tokenId].edition = determineEdition(recipients[recipientId].nftCount + 1);

        recipients[recipientId].nftCount++;
        ownerToTokenList[receiver].push(tokenId);

        nftList.push(tokenId);

        emit Transfer(address(0), receiver, tokenId);
    }
}
