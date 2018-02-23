#!/bin/bash
osascript -e 'tell application "iTerm"
activate
create window with profile "Default"
tell the current window
tell the current session
delay 1
write text "testrpc"
delay 1
end tell
end tell
end tell'
osascript -e 'tell application "iTerm"
activate
create window with profile "Default"
tell the current window
tell the current session
delay 1
write text "cd ~/cryptogs;atom ."
delay 1
end tell
end tell
end tell'
osascript -e 'tell application "iTerm"
activate
create window with profile "Default"
tell the current window
tell the current session
delay 1
write text "cd ~/cryptogs/gatsby-site/;gatsby develop"
delay 1
end tell
end tell
end tell'
clevis test full
