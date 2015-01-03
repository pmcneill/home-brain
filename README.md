Home Brain is an event- and rule-based home automation system.

== The Rules

Sensors are the inputs to Home Brain.  These can be direct inputs, like a
switch being flipped, or just a way to link into the outside world, such as
with the "daylight" sensor (which reports the times of sunrise and sunset,
as well as a simple "isDark" boolean).

Devices are the outputs: the light bulbs, the motors, the outlets.  Each
device class defines any number of axes of control.  A switch might just have
an on/off boolean, while a color-changing lightbulb might have brightness, hue,
and saturation.  Each control axis has a default state, defined when an 
instance of a device is created, so, for instance, in the abscense of any
other control, the porch light might turn on while the living room light is
off.

Third, there are rules to bind everything together.  Any number of devices
can be assigned to a rule, as well as how to set any (or all) of the axes on 
that device.  A rule also has an evaluation function to determine whether or 
not it's active.  That function can look at sensors, or anything else, to
make its decision.

Each rule, within the "state", has a pre-defined priority.  The higher the 
priority number, the more likely the rule is to have an effect.  On each
update, the rules are evaluated from lowest to highest priority, building up
a new picture of what the world should look like.  That means a top-level
"lights off, I'm on vacation" will override any normal scheduling, even though
both sets of rules are running.

A rule only affects the state of the world if its evaluation function is
enabled.  They're not really "on" or "off", but instead more "active" or
"don't care".  This makes it trivial to have rules working on the same
devices -- "lights on from 4 to 10" and "lights on for 5 minutes when there's
motion" will never conflict.  You won't see the motion rule turning the light
off at 5:30, since it's only ever responsible for turning lights _on_.
Similarly, if there's motion at 9:58, the lights will stay on until 10:03,
even though the 4-to-10 rule implies the should turn off at 10.  If there
aren't any rules giving a device instructions, it will fall back to its
default setting (likely, but not necessarily, off).

== The Events

Once a system is configured with all of its rules, they need to run regularly
and, ideally, efficiently.  There are two ways that Home Brain's global
"update" function will be invoked: by time and by interrupt.

By default, Home Brain will run an update every 30 minutes.  However, each
rule is allowed to ask for an earlier update.  For instance, a "lights on at
dark" rule can ask for an update in 13 minutes, if that's when the sun will
set.  The earliest request update time will be selected, then the server will
sleep until then.  The update times are only valid for the upcoming cycle, so
they're recalculated each go-round (since rules are the best judges of when
it's a good time to run).  In the example above, if another rule set the
update time to 2 minutes, "lights on at dark" would change its timer to 11
minutes during the subsequent update.

Sensors are allowed to interrupt the timing flow and force an immediate 
update when their values change.  The Sensor#changed() method bubbles up
to the state and runs the global update.  The scheduled update is cancelled,
and a new one is scheduled according to the normal timing rules.

== Some Examples


