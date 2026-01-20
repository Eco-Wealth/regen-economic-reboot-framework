package keeper

import (
    "github.com/cosmos/cosmos-sdk/codec"
)

type Keeper struct {
    cdc codec.BinaryCodec
    // TODO: add bank keeper, mint keeper, protocolpool keeper, circuit keeper, paramstore
}

func NewKeeper(cdc codec.BinaryCodec) Keeper {
    return Keeper{cdc: cdc}
}
