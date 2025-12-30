import json
import os
import unittest
from sim.poa_simulator import simulate_epoch, Config, Authority

class TestSimulator(unittest.TestCase):
    def test_example_epoch_matches_expected(self):
        here = os.path.dirname(__file__)
        scenario_path = os.path.join(here, "..", "sim", "scenarios", "example_epoch.json")
        scenario_path = os.path.abspath(scenario_path)
        with open(scenario_path, "r", encoding="utf-8") as f:
            scenario = json.load(f)

        cfg = Config(
            fee_total=int(scenario["fee_total"]),
            validator_fraction=float(scenario["validator_fraction"]),
            burn_fraction=float(scenario["burn_fraction"]),
            beta_max=float(scenario.get("beta_max", 0.15)),
        )
        authorities = [Authority(a["authority_id"], float(a.get("beta", 0.0))) for a in scenario["authorities"]]

        out = simulate_epoch(cfg, authorities)
        exp = scenario["expected"]

        self.assertEqual(out["validator_pool"], exp["validator_pool"])
        self.assertEqual(out["burn_pool"], exp["burn_pool"])
        self.assertEqual(out["community_pool"], exp["community_pool"])
        self.assertEqual(out["payout_sum"], exp["validator_pool"])

        payouts = {a["authority_id"]: a["payout"] for a in out["authorities"]}
        self.assertEqual(payouts, exp["payouts_by_authority"])

if __name__ == "__main__":
    unittest.main()
