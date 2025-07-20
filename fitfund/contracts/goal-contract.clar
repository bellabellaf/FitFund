;; FitFund - Health Goal Verification Contract
(define-data-var admin principal tx-sender)

;; Stores each user's goal data
(define-map user-goals
  { user: principal, goal-id: uint }
  {
    goal-type: (string-ascii 32),
    target: int,
    deadline: uint,
    verified: bool
  }
)

;; Tracks claimed rewards to prevent duplicates
(define-map claimed-goals
  { user: principal, goal-id: uint }
  bool
)

;; Error constants
(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-GOAL-EXISTS u101)
(define-constant ERR-GOAL-NOT-FOUND u102)
(define-constant ERR-ALREADY-VERIFIED u103)
(define-constant ERR-REWARD-CLAIMED u104)

;; Admin check
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; Create a new goal
(define-public (create-goal
  (goal-id uint)
  (goal-type (string-ascii 32))
  (target int)
  (deadline uint)
)
  (let ((key { user: tx-sender, goal-id: goal-id }))
    (begin
      (asserts! (is-none (map-get? user-goals key)) (err ERR-GOAL-EXISTS))
      (map-set user-goals key {
        goal-type: goal-type,
        target: target,
        deadline: deadline,
        verified: false
      })
      (ok true)
    )
  )
)

;; Admin verifies a user's goal
(define-public (verify-goal (user principal) (goal-id uint))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (let ((key { user: user, goal-id: goal-id }))
      (match (map-get? user-goals key)
        goal-data
          (begin
            (asserts! (is-eq (get verified goal-data) false) (err ERR-ALREADY-VERIFIED))
            (map-set user-goals key (merge goal-data { verified: true }))
            (ok true)
          )
        (err ERR-GOAL-NOT-FOUND)
      )
    )
  )
)

;; User claims reward for a verified goal
(define-public (claim-reward (goal-id uint))
  (let ((key { user: tx-sender, goal-id: goal-id }))
    (match (map-get? user-goals key)
      goal-data
        (begin
          (asserts! (is-eq (get verified goal-data) true) (err ERR-NOT-AUTHORIZED))
          (asserts! (is-none (map-get? claimed-goals key)) (err ERR-REWARD-CLAIMED))
          (map-set claimed-goals key true)
          (ok true)
        )
      (err ERR-GOAL-NOT-FOUND)
    )
  )
)

;; Transfer admin rights to a new principal
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)
  )
)
