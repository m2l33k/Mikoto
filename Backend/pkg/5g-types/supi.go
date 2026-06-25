package types5g

// SUPI is a Subscription Permanent Identifier (e.g. "imsi-208930000000001").
type SUPI string

// SUCI is a Subscription Concealed Identifier — the encrypted form of a SUPI.
type SUCI string

// IMSI is the International Mobile Subscriber Identity portion of a SUPI.
type IMSI string

// MSIN returns the subscriber portion of an IMSI given a PLMN.
func (i IMSI) MSIN(p PLMN) string {
	prefix := p.MCC + p.MNC
	s := string(i)
	if len(s) > len(prefix) {
		return s[len(prefix):]
	}
	return s
}
