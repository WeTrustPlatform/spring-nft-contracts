pragma solidity ^0.4.24;

/**
 * @dev Implementation of standard for detect smart contract interfaces.
 */
contract SupportsInterface {
    /**
     * @dev Mapping of supported intefraces.
     * @notice You must not set element 0xffffffff to true.
     */
    mapping(bytes4 => bool) internal supportedInterfaces;

    /**
     * @dev Contract constructor.
     */
    constructor()
    public
    {
        supportedInterfaces[0x01ffc9a7] = true; // ERC165
        supportedInterfaces[0x780e9d63] = true; // ERC721Enumerable
        supportedInterfaces[0x5b5e139f] = true; // ERC721MetaData
        supportedInterfaces[0x80ac58cd] = true; // ERC721
    }

    /**
     * @dev Function to check which interfaces are suported by this contract.
     * @param _interfaceID Id of the interface.
     */
    function supportsInterface(
        bytes4 _interfaceID
    )
    external
    view
    returns (bool)
    {
        return supportedInterfaces[_interfaceID];
    }

}