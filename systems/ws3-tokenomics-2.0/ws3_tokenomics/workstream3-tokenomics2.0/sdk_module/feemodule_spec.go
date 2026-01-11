// x/feemodule (Tokenomics 2.0) — Engineering Spec Skeleton (v0.1)
// NOTE: This is a spec-oriented scaffold for Regen R&D. Not production-ready code.
//
// Goal: Route registry value-based fees (FeeRate) into:
//
//   - Burn (BurnShare)
//   - Validator rewards (ValidatorShare)
//   - Community pool (CommunityShare)
//
// Denom: uregen
//
// Key properties:
//   - All parameters are governance-controlled.
//   - Shares must sum to 1.0.
//   - Optional max fee cap protects against misconfiguration.
//
// Tested against a marketplace throughput proxy (sell orders) for 90d.
// See: workstream3-tokenomics2.0/simulations/*

package feemodule

import (
    "fmt"

    sdk "github.com/cosmos/cosmos-sdk/types"
)

const (
    ModuleName = "feemodule"
    StoreKey   = ModuleName
)

type BankKeeper interface {
    BurnCoins(ctx sdk.Context, moduleName string, amounts sdk.Coins) error
    SendCoinsFromAccountToModule(ctx sdk.Context, fromAddr sdk.AccAddress, toModule string, amt sdk.Coins) error
    SendCoinsFromModuleToModule(ctx sdk.Context, senderModule, recipientModule string, amt sdk.Coins) error
}

type DistributionKeeper interface {
    // Implementer should wire to the chain's validator-reward plumbing (PoA or distribution module).
    AllocateTokensToValidators(ctx sdk.Context, amt sdk.Coin) error
    FundCommunityPool(ctx sdk.Context, amt sdk.Coin, depositor sdk.AccAddress) error
}

type Keeper struct {
    bank BankKeeper
    dist DistributionKeeper
    // params keeper omitted in this skeleton
}

type Params struct {
    FeeRate        sdk.Dec // e.g. 0.02
    BurnShare      sdk.Dec // e.g. 0.50
    ValidatorShare sdk.Dec // e.g. 0.25
    CommunityShare sdk.Dec // e.g. 0.25
    MaxFeeRate     sdk.Dec // e.g. 0.05 (safety cap)
}

func (p Params) Validate() error {
    if p.FeeRate.IsNegative() || p.FeeRate.GT(p.MaxFeeRate) {
        return fmt.Errorf("invalid FeeRate: %s", p.FeeRate)
    }
    sum := p.BurnShare.Add(p.ValidatorShare).Add(p.CommunityShare)
    if !sum.Equal(sdk.OneDec()) {
        return fmt.Errorf("shares must sum to 1.0, got %s", sum)
    }
    return nil
}

// RouteRegistryFee should be invoked by registry module hooks when a value-bearing action occurs.
// creditValue is denominated in uregen (or a base denom representing on-chain value).
func (k Keeper) RouteRegistryFee(ctx sdk.Context, payer sdk.AccAddress, creditValue sdk.Coin, params Params) error {
    if err := params.Validate(); err != nil {
        return err
    }

    // fee = creditValue * FeeRate
    feeAmtDec := sdk.NewDecFromInt(creditValue.Amount).Mul(params.FeeRate)
    feeAmt := feeAmtDec.TruncateInt()
    if feeAmt.IsZero() {
        return nil
    }

    feeCoin := sdk.NewCoin(creditValue.Denom, feeAmt)

    // Collect fee into module account first
    if err := k.bank.SendCoinsFromAccountToModule(ctx, payer, ModuleName, sdk.NewCoins(feeCoin)); err != nil {
        return err
    }

    return k.DistributeFee(ctx, feeCoin, params)
}

func (k Keeper) DistributeFee(ctx sdk.Context, fee sdk.Coin, params Params) error {
    burnAmt := sdk.NewDecFromInt(fee.Amount).Mul(params.BurnShare).TruncateInt()
    valAmt := sdk.NewDecFromInt(fee.Amount).Mul(params.ValidatorShare).TruncateInt()
    // remainder -> community to avoid rounding drift
    comAmt := fee.Amount.Sub(burnAmt).Sub(valAmt)

    denom := fee.Denom

    // Burn
    if !burnAmt.IsZero() {
        if err := k.bank.BurnCoins(ctx, ModuleName, sdk.NewCoins(sdk.NewCoin(denom, burnAmt))); err != nil {
            return err
        }
    }

    // Validators
    if !valAmt.IsZero() {
        if err := k.dist.AllocateTokensToValidators(ctx, sdk.NewCoin(denom, valAmt)); err != nil {
            return err
        }
    }

    // Community pool (wire either to distribution community pool or dedicated treasury module)
    if !comAmt.IsZero() {
        // If using FundCommunityPool, you may need a depositor address; use module acc or a designated signer.
        // This skeleton uses nil depositor placeholder.
        if err := k.dist.FundCommunityPool(ctx, sdk.NewCoin(denom, comAmt), nil); err != nil {
            return err
        }
    }

    // Emit events in real implementation (omitted here)
    return nil
}
