pragma solidity ^0.4.24;

import "./interface/ERC721.sol";
import "./interface/ERC721TokenReceiver.sol";
import "./interface/SupportsInterface.sol";
import "./utils/AddressUtils.sol";

/**
 * @dev Implementation of ERC-721 non-fungible token standard specifically for WeTrust Spring.
 */
contract NFToken is ERC721, SupportsInterface {
    using AddressUtils for address;

    ///////////////////////////
    // Constants
    //////////////////////////

    /**
     * @dev Magic value of a smart contract that can recieve NFT.
     * Equal to: bytes4(keccak256("onERC721Received(address,address,uint256,bytes)")).
     */
    bytes4 constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;

    //////////////////////////
    // Events
    //////////////////////////

    /**
     * @dev Emits when ownership of any NFT changes by any mechanism. This event emits when NFTs are
     * created (`from` == 0) and destroyed (`to` == 0). Exception: during contract creation, any
     * number of NFTs may be created and assigned without emitting Transfer. At the time of any
     * transfer, the approved address for that NFT (if any) is reset to none.
     * @param _from Sender of NFT (if address is zero address it indicates token creation).
     * @param _to Receiver of NFT (if address is zero address it indicates token destruction).
     * @param _tokenId The NFT that got transfered.
     */
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);

    /**
     * @dev This emits when the approved address for an NFT is changed or reaffirmed. The zero
     * address indicates there is no approved address. When a Transfer event emits, this also
     * indicates that the approved address for that NFT (if any) is reset to none.
     * @param _owner Owner of NFT.
     * @param _approved Address that we are approving.
     * @param _tokenId NFT which we are approving.
     */
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);

    /**
     * @dev This emits when an operator is enabled or disabled for an owner. The operator can manage
     * all NFTs of the owner.
     * @param _owner Owner of NFT.
     * @param _operator Address to which we are setting operator rights.
     * @param _approved Status of operator rights(true if operator rights are given and false if
     * revoked).
     */
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    ////////////////////////////////
    // Modifiers
    ///////////////////////////////

    /**
     * @dev Guarantees that the msg.sender is an owner or operator of the given NFT.
     * @param _tokenId ID of the NFT to validate.
     */
    modifier canOperate(uint256 _tokenId) {
        address tokenOwner = nft[_tokenId].owner;
        require(tokenOwner == msg.sender || ownerToOperators[tokenOwner][msg.sender], "Sender is not an authorized operator of this token");
        _;
    }

    /**
     * @dev Guarantees that the msg.sender is allowed to transfer NFT.
     * @param _tokenId ID of the NFT to transfer.
     */
    modifier canTransfer(uint256 _tokenId) {
        address tokenOwner = nft[_tokenId].owner;
        require(
            tokenOwner == msg.sender ||
            getApproved(_tokenId) == msg.sender || ownerToOperators[tokenOwner][msg.sender],
            "Sender does not have permission to transfer this Token");

        _;
    }

    /**
     * @dev Check to make sure the address is not zero address
     * @param toTest The Address to make sure it's not zero address
     */
    modifier onlyNonZeroAddress(address toTest) {
        require(toTest != address(0), "Address must be non zero address");
        _;
    }

    /**
     * @dev Guarantees that no owner exists for the nft
     * @param nftId NFT to test
     */
    modifier noOwnerExists(uint256 nftId) {
        require(nft[nftId].owner == address(0), "Owner must not exist for this token");
        _;
    }

    /**
     * @dev Guarantees that an owner exists for the nft
     * @param nftId NFT to test
     */
    modifier ownerExists(uint256 nftId) {
        require(nft[nftId].owner != address(0), "Owner must exist for this token");
        _;
    }

    ///////////////////////////
    // Storage Variable
    //////////////////////////

    /**
     * @dev A mapping from NFT ID to the address that owns it.
     */
    mapping (uint256 => NFT) public nft;

    /**
     * @dev Number of total NFT, used to determine the next ID during creation of new NFT
     */
    uint256 nftCount;

    /**
    * @dev Mapping from owner address to count of his tokens.
    */
    mapping (address => uint256) internal ownerToNFTokenCount;

    /**
     * @dev Mapping from owner address to mapping of operator addresses.
     */
    mapping (address => mapping (address => bool)) internal ownerToOperators;

    struct NFT {
        address owner;
        address approval;
        bytes32 traits;
        uint16 edition;
        bytes4 nftType;
        bytes32 recipientId;
        uint256 createdAt;
    }

    ////////////////////////////////
    // Public Functions
    ///////////////////////////////

    /**
     * @dev Contract constructor.
     */
    constructor() public {
        supportedInterfaces[0x80ac58cd] = true;
    }

    /**
     * @dev Returns the number of NFTs owned by `_owner`. NFTs assigned to the zero address are
     * considered invalid, and this function throws for queries about the zero address.
     * @param _owner Address for whom to query the balance.
     */
    function balanceOf(address _owner) onlyNonZeroAddress(_owner) external view returns (uint256) {
        return ownerToNFTokenCount[_owner];
    }

    /**
     * @dev Returns the address of the owner of the NFT. NFTs assigned to zero address are considered
     * invalid, and queries about them do throw.
     * @param _tokenId The identifier for an NFT.
     */
    function ownerOf(uint256 _tokenId) ownerExists(_tokenId) external view returns (address _owner) {
        return nft[_tokenId].owner;
    }

    /**
     * @dev Transfers the ownership of an NFT from one address to another address.
     * @notice Throws unless `msg.sender` is the current owner, an authorized operator, or the
     * approved address for this NFT. Throws if `_from` is not the current owner. Throws if `_to` is
     * the zero address. Throws if `_tokenId` is not a valid NFT. When transfer is complete, this
     * function checks if `_to` is a smart contract (code size > 0). If so, it calls `onERC721Received`
     * on `_to` and throws if the return value is not `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`.
     * @param _from The current owner of the NFT.
     * @param _to The new owner.
     * @param _tokenId The NFT to transfer.
     * @param _data Additional data with no specified format, sent in call to `_to`.
     */
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes _data) external {
        _safeTransferFrom(_from, _to, _tokenId, _data);
    }

    /**
     * @dev Transfers the ownership of an NFT from one address to another address.
     * @notice This works identically to the other function with an extra data parameter, except this
     * function just sets data to ""
     * @param _from The current owner of the NFT.
     * @param _to The new owner.
     * @param _tokenId The NFT to transfer.
     */
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external {
        _safeTransferFrom(_from, _to, _tokenId, "");
    }

    /**
     * @dev Throws unless `msg.sender` is the current owner, an authorized operator, or the approved
     * address for this NFT. Throws if `_from` is not the current owner. Throws if `_to` is the zero
     * address. Throws if `_tokenId` is not a valid NFT.
     * @notice The caller is responsible to confirm that `_to` is capable of receiving NFTs or else
     * they maybe be permanently lost.
     * @param _from The current owner of the NFT.
     * @param _to The new owner.
     * @param _tokenId The NFT to transfer.
     */
    function transferFrom(address _from, address _to, uint256 _tokenId)
        onlyNonZeroAddress(_to)
        canTransfer(_tokenId)
        ownerExists(_tokenId)
        external
    {

        address tokenOwner = nft[_tokenId].owner;
        require(tokenOwner == _from, "from address must be owner of tokenId");

        _transfer(_to, _tokenId);
    }

    /**
     * @dev Set or reaffirm the approved address for an NFT.
     * @notice The zero address indicates there is no approved address. Throws unless `msg.sender` is
     * the current NFT owner, or an authorized operator of the current owner.
     * @param _approved Address to be approved for the given NFT ID.
     * @param _tokenId ID of the token to be approved.
     */
    function approve(address _approved, uint256 _tokenId)
        canOperate(_tokenId)
        ownerExists(_tokenId)
        external
    {

        address tokenOwner = nft[_tokenId].owner;
        require(_approved != tokenOwner, "approved address cannot be owner of the token");

        nft[_tokenId].approval = _approved;
        emit Approval(tokenOwner, _approved, _tokenId);
    }

    /**
     * @dev Enables or disables approval for a third party ("operator") to manage all of
     * `msg.sender`'s assets. It also emits the ApprovalForAll event.
     * @notice This works even if sender doesn't own any tokens at the time.
     * @param _operator Address to add to the set of authorized operators.
     * @param _approved True if the operators is approved, false to revoke approval.
     */
    function setApprovalForAll(address _operator, bool _approved)
        onlyNonZeroAddress(_operator)
        external
    {

        ownerToOperators[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    /**
     * @dev Get the approved address for a single NFT.
     * @notice Throws if `_tokenId` is not a valid NFT.
     * @param _tokenId ID of the NFT to query the approval of.
     */
    function getApproved(uint256 _tokenId)
        ownerExists(_tokenId)
        public view returns (address)
    {

        return nft[_tokenId].approval;
    }

    /**
     * @dev Checks if `_operator` is an approved operator for `_owner`.
     * @param _owner The address that owns the NFTs.
     * @param _operator The address that acts on behalf of the owner.
     */
    function isApprovedForAll(address _owner, address _operator)
        onlyNonZeroAddress(_owner)
        onlyNonZeroAddress(_operator)
        external view returns (bool)
    {

        return ownerToOperators[_owner][_operator];
    }

    /////////////////////////////
    // Private Functions
    ////////////////////////////

    /**
     * @dev Actually preforms the transfer.
     * @notice Does NO checks.
     * @param _to Address of a new owner.
     * @param _tokenId The NFT that is being transferred.
     */
    function _transfer(address _to, uint256 _tokenId) private {
        address from = nft[_tokenId].owner;
        clearApproval(_tokenId);

        removeNFToken(from, _tokenId);
        addNFToken(_to, _tokenId);

        emit Transfer(from, _to, _tokenId);
    }

    function _safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes _data)
        onlyNonZeroAddress(_to)
        canTransfer(_tokenId)
        ownerExists(_tokenId)
        internal
    {
        address tokenOwner = nft[_tokenId].owner;
        require(tokenOwner == _from, "from address must be owner of tokenId");

        _transfer(_to, _tokenId);

        if (_to.isContract()) {
            bytes4 retval = ERC721TokenReceiver(_to).onERC721Received(msg.sender, _from, _tokenId, _data);
            require(retval == MAGIC_ON_ERC721_RECEIVED, "reciever contract did not return the correct return value");
        }
    }

    /**
     * @dev Clears the current approval of a given NFT ID.
     * @param _tokenId ID of the NFT to be transferred.
     */
    function clearApproval(uint256 _tokenId) private {
        if(nft[_tokenId].approval != address(0))
        {
            delete nft[_tokenId].approval;
        }
    }

    /**
     * @dev Removes a NFT from owner.
     * @notice Use and override this function with caution. Wrong usage can have serious consequences.
     * @param _from Address from wich we want to remove the NFT.
     * @param _tokenId Which NFT we want to remove.
     */
    function removeNFToken(address _from, uint256 _tokenId) internal {
        require(nft[_tokenId].owner == _from, "from address must be owner of tokenId");
        assert(ownerToNFTokenCount[_from] > 0);
        ownerToNFTokenCount[_from] = ownerToNFTokenCount[_from] - 1;
        delete nft[_tokenId].owner;
    }

    /**
     * @dev Assignes a new NFT to owner.
     * @notice Use and override this function with caution. Wrong usage can have serious consequences.
     * @param _to Address to wich we want to add the NFT.
     * @param _tokenId Which NFT we want to add.
     */
    function addNFToken(address _to, uint256 _tokenId)
        noOwnerExists(_tokenId)
        internal
    {

        nft[_tokenId].owner = _to;
        ownerToNFTokenCount[_to]++;
        nftCount++;
    }

}
