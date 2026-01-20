package types

// Params mirrors proto Params. Implement ParamSetPairs and validation with bounds from docs/PARAMETERS.md.
type Params struct {
    CapTotalSupply  string
    MaxMintPerWindow string
    MaxBurnPerWindow string
    DeadbandBps     uint32
    Alpha           string
    Beta            string
    EcoIndexEnabled bool
    EcoIndexWeight  string
}
