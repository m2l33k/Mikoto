package alerts

import "sync"

// Publisher fans out alerts to subscribed WebSocket clients.
type Publisher struct {
	mu   sync.RWMutex
	subs map[chan Alert]struct{}
}

// NewPublisher builds a Publisher.
func NewPublisher() *Publisher { return &Publisher{subs: map[chan Alert]struct{}{}} }

// Subscribe registers a new subscriber channel.
func (p *Publisher) Subscribe() chan Alert {
	ch := make(chan Alert, 16)
	p.mu.Lock()
	p.subs[ch] = struct{}{}
	p.mu.Unlock()
	return ch
}

// Unsubscribe removes and closes a subscriber channel.
func (p *Publisher) Unsubscribe(ch chan Alert) {
	p.mu.Lock()
	if _, ok := p.subs[ch]; ok {
		delete(p.subs, ch)
		close(ch)
	}
	p.mu.Unlock()
}

// Broadcast sends an alert to all subscribers (non-blocking).
func (p *Publisher) Broadcast(a Alert) {
	p.mu.RLock()
	defer p.mu.RUnlock()
	for ch := range p.subs {
		select {
		case ch <- a:
		default:
		}
	}
}
