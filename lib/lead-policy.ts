// Every step of a booking that waits on one person has a deadline, so nobody
// waits forever when the other side goes quiet. Enforced each minute by
// advanceWaves (lib/matching.ts); kept in hours so the screens can quote them.
export const DIRECT_REQUEST_HOURS  = 12; // a cleaner the client picked must answer, or the normal rounds take over
export const CLIENT_DECISION_HOURS = 24; // a client must accept or decline a cleaner who answered (never past the job time)
export const AUTO_COMPLETE_HOURS   = 72; // a booked job closes itself this long after its time, unless a dispute is open
