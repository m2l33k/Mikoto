// Command cli runs conformance scenarios and exits non-zero on failure (CI/CD).
package main

import (
	"context"
	"flag"
	"fmt"
	"os"

	"github.com/securecode5g/test-runner/internal/adapter"
	"github.com/securecode5g/test-runner/internal/adapter/free5gc"
	"github.com/securecode5g/test-runner/internal/adapter/open5gs"
	"github.com/securecode5g/test-runner/internal/executor"
	"github.com/securecode5g/test-runner/internal/report"
	"github.com/securecode5g/test-runner/internal/scenario"
)

func main() {
	core := flag.String("core", "free5gc", "target core: free5gc|open5gs")
	dir := flag.String("scenarios", "/scenarios", "scenarios directory")
	flag.Parse()

	ad := newAdapter(*core)
	exec := executor.New(ad)
	rep := report.New("cli-run", ad.Name())

	ctx := context.Background()
	files := flag.Args()
	if len(files) == 0 {
		fmt.Fprintln(os.Stderr, "no scenario files given")
		os.Exit(2)
	}

	for _, f := range files {
		_ = dir
		sc, err := scenario.Parse(f)
		if err != nil {
			fmt.Fprintf(os.Stderr, "parse %s: %v\n", f, err)
			os.Exit(2)
		}
		rep.Add(exec.Run(ctx, sc))
	}

	r := rep.Finish()
	report.WriteSummary(os.Stdout, r)
	if r.Failed > 0 {
		os.Exit(1)
	}
}

func newAdapter(core string) adapter.CoreAdapter {
	switch core {
	case "open5gs":
		return open5gs.New("/etc/open5gs", map[string]string{})
	default:
		return free5gc.New("/free5GC/config", map[string]string{})
	}
}
