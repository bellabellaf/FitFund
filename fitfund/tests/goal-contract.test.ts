import { describe, it, expect, beforeEach } from "vitest";

type GoalKey = string;

const makeGoalKey = (user: string, goalId: number): GoalKey =>
  `${user}-${goalId}`;

const mockContract = {
  admin: "ST1ADMINADDRESS000000000000000000000000000",
  userGoals: new Map<GoalKey, any>(),
  claimedGoals: new Map<GoalKey, boolean>(),

  isAdmin(caller: string): boolean {
    return caller === this.admin;
  },

  createGoal(
    caller: string,
    goalId: number,
    goalType: string,
    target: number,
    deadline: number
  ) {
    const key = makeGoalKey(caller, goalId);
    if (this.userGoals.has(key)) {
      return { error: 101 }; // ERR-GOAL-EXISTS
    }

    this.userGoals.set(key, {
      goalType,
      target,
      deadline,
      verified: false,
    });
    return { value: true };
  },

  verifyGoal(caller: string, user: string, goalId: number) {
    if (!this.isAdmin(caller)) {
      return { error: 100 }; // ERR-NOT-AUTHORIZED
    }

    const key = makeGoalKey(user, goalId);
    const goal = this.userGoals.get(key);
    if (!goal) return { error: 102 }; // ERR-GOAL-NOT-FOUND
    if (goal.verified) return { error: 103 }; // ERR-ALREADY-VERIFIED

    goal.verified = true;
    this.userGoals.set(key, goal);
    return { value: true };
  },

  claimReward(caller: string, goalId: number) {
    const key = makeGoalKey(caller, goalId);
    const goal = this.userGoals.get(key);
    if (!goal) return { error: 102 }; // ERR-GOAL-NOT-FOUND
    if (!goal.verified) return { error: 100 }; // ERR-NOT-AUTHORIZED
    if (this.claimedGoals.has(key)) return { error: 104 }; // ERR-REWARD-CLAIMED

    this.claimedGoals.set(key, true);
    return { value: true };
  },

  transferAdmin(caller: string, newAdmin: string) {
    if (!this.isAdmin(caller)) {
      return { error: 100 };
    }
    this.admin = newAdmin;
    return { value: true };
  },
};

describe("Goal Contract", () => {
  beforeEach(() => {
    mockContract.admin = "ST1ADMINADDRESS000000000000000000000000000";
    mockContract.userGoals = new Map();
    mockContract.claimedGoals = new Map();
  });

  it("should allow a user to create a goal", () => {
    const result = mockContract.createGoal(
      "ST2USER000000000000000000000000000000000",
      1,
      "steps",
      70000,
      1720000000
    );
    expect(result).toEqual({ value: true });
  });

  it("should prevent creating duplicate goals", () => {
    const user = "ST2USER";
    mockContract.createGoal(user, 1, "steps", 70000, 1720000000);
    const result = mockContract.createGoal(user, 1, "steps", 70000, 1720000000);
    expect(result).toEqual({ error: 101 });
  });

  it("should allow admin to verify a goal", () => {
    const user = "ST2USER";
    mockContract.createGoal(user, 2, "sleep", 56, 1720000000);
    const result = mockContract.verifyGoal(
      "ST1ADMINADDRESS000000000000000000000000000",
      user,
      2
    );
    expect(result).toEqual({ value: true });
  });

  it("should prevent non-admin from verifying a goal", () => {
    const user = "ST2USER";
    mockContract.createGoal(user, 3, "sleep", 56, 1720000000);
    const result = mockContract.verifyGoal("ST2USER", user, 3);
    expect(result).toEqual({ error: 100 });
  });

  it("should allow verified users to claim reward", () => {
    const user = "ST2USER";
    mockContract.createGoal(user, 4, "water", 2000, 1720000000);
    mockContract.verifyGoal("ST1ADMINADDRESS000000000000000000000000000", user, 4);
    const result = mockContract.claimReward(user, 4);
    expect(result).toEqual({ value: true });
  });

  it("should prevent claiming reward twice", () => {
    const user = "ST2USER";
    mockContract.createGoal(user, 5, "sleep", 56, 1720000000);
    mockContract.verifyGoal("ST1ADMINADDRESS000000000000000000000000000", user, 5);
    mockContract.claimReward(user, 5);
    const result = mockContract.claimReward(user, 5);
    expect(result).toEqual({ error: 104 });
  });

  it("should allow admin transfer", () => {
    const result = mockContract.transferAdmin(
      "ST1ADMINADDRESS000000000000000000000000000",
      "ST3NEWADMIN0000000000000000000000000000000"
    );
    expect(result).toEqual({ value: true });
    expect(mockContract.admin).toBe("ST3NEWADMIN0000000000000000000000000000000");
  });
});
