'use strict'
const protons = require('protons')
// from: https://github.com/ipfs/go-ipfs/blob/master/exchange/bitswap/message/pb/message.proto

module.exports = protons(`
  message Message {
    message Wantlist {
      message Entry {
        // changed from string to bytes, it makes a difference in JavaScript
        optional bytes block = 1;      // the block cid (cidV0 in bitswap 1.0.0, cidV1 in bitswap 1.1.0)
        optional int32 priority = 2;    // the priority (normalized). default to 1
        optional bool cancel = 3;       // whether this revokes an entry
      }

      repeated Entry entries = 1;       // a list of wantlist entries
      optional bool full = 2;           // whether this is the full wantlist. default to false
    }

    message Block {
      optional bytes prefix = 1;        // CID prefix (cid version, multicodec and multihash prefix (type + length)
      optional bytes data = 2;
    }

    optional Wantlist wantlist = 1;
    repeated bytes blocks = 2;          // used to send Blocks in bitswap 1.0.0
    repeated Block payload = 3;         // used to send Blocks in bitswap 1.1.0
  }
`)
