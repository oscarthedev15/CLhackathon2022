// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract APIConsumer is ChainlinkClient {
    using Chainlink for Chainlink.Request;

    uint256 public volume;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    string private apiURL;
    string[] public keywords = ["Yastremska"];
 
    constructor() {
        setPublicChainlinkToken();
        oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8;
        jobId = "d5270d1c311941d0b08bead21fea7747";
        fee = 0.1 * 10 ** 18; // (Varies by network and job)
        buildAPIURL();
    }

    function requestVolumeData() public returns (bytes32 requestId) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);

        // Set the URL to perform the GET request on
        request.add("get", apiURL);
        request.add("path", "pagination,total"); // Chainlink nodes 1.0.0 and later support this format
        return sendChainlinkRequestTo(oracle, request, fee);
    }


    function fulfill(bytes32 _requestId, uint256 _volume) public recordChainlinkFulfillment(_requestId){
        uint256 temp_volume = _volume / 100;
        volume = temp_volume;
    }

    function buildAPIURL() private returns (string memory){
        string memory start_string = "http://api.mediastack.com/v1/news?access_key=6d5eed71083f4b5bd2aad91193c29364&";
        string memory keywords_string = "keywords=";
        for(uint i = 0 ; i < keywords.length; i++){
            string memory word = keywords[i];
            if(i == keywords.length -1){
                keywords_string = string(abi.encodePacked(keywords_string,word));
            }
            else{
                keywords_string = string(abi.encodePacked(keywords_string,word,","));
            }
        }
        string memory end_string = "&countries=us&date=2022-02-24,2022-03-01&limit=1%22";
        apiURL = string(abi.encodePacked(start_string,keywords_string,end_string));
        return apiURL;

    }
}