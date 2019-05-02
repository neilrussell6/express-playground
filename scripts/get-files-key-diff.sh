#!/bin/bash
awk '/^(#| #)/ {next} {gsub(/ /, "", $0)} !NF {next}; {print $1}' FS="=" $2 $2 $1 | sort | uniq -u
