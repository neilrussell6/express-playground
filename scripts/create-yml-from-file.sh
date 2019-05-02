#!/bin/bash
awk '/^(#| #)/ {next} {gsub(/ /, "", $0)} !NF {next}; {print " "$1": \""$2"\""}' FS="=" $1 >> $2
