=== Timed Event Block ===
Contributors: santiagodel76
Tags: gutenberg, event, schedule, countdown, fse
Requires at least: 6.5
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 0.1.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Schedule event visibility and create flexible event layouts with native Gutenberg blocks for modern WordPress editing workflows.

== Description ==

Timed Event Block adds a server-rendered parent block for scheduling event content by date/time, plus dedicated child blocks for dynamic date, time, and countdown output.

Ideal for event listings such as movie showtimes, class schedules, workshops, conferences, livestreams, and similar use cases. It requires no global configuration: install the plugin and start using the block directly in FSE workflows.

This plugin is designed for full site editing workflows where content creators need:

* A single event container that can hold any core block (text, media, embeds, columns, groups, etc.).
* Automatic status handling based on current server time:
* Scheduled
* Active
* Ended
* Optional automatic hiding of ended events (`Hide when ended`).
* Child blocks that can be used only inside the Timed Event parent:
* Event Date
* Event Time
* Event Countdown
* Dynamic frontend updates for status/time/countdown without page refresh.
* Native Gutenberg style controls (spacing, color, typography, border, dimensions) on parent and child blocks.

How it works:

1. Add a **Timed Event** block.
2. Set start date/time and duration.
3. Insert any content you want.
4. Optionally insert child blocks:
* **Event Date** for date display with site/custom format.
* **Event Time** for scheduled time and active/ended label transitions.
* **Event Countdown** for countdown to start/end and status transitions.
5. Publish. Frontend output is resolved server-side, and dynamic text updates via lightweight view scripts.

== Blocks ==

= Timed Event =
Parent container block that controls event lifecycle and visibility.

Features:
* Start date and time.
* Duration in minutes.
* Hide when ended toggle.
* Full inner content flexibility.

= Event Date =
Child block (ancestor-restricted to Timed Event) that reads parent context and renders formatted date.

Features:
* Site default format or custom format string.
* Uses WordPress timezone and date settings by default.

= Event Time =
Child block that reads parent context and renders:
* Scheduled state: formatted time.
* Active state: configurable active label.
* Ended state: configurable ended label.

Features:
* Site/custom time format.
* Editable active/ended labels.
* Editable active/ended colors.
* Dynamic frontend state update.

= Event Countdown =
Child block that reads parent context and renders:
* Countdown to start or countdown to end.
* Active/ended label after countdown completion.

Features:
* Target mode: `to_start` or `to_end`.
* Day visibility toggle.
* Custom separator.
* Editable active/ended labels.
* Editable active/ended colors.
* Dynamic frontend state update.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/`, or install it as a ZIP from **Plugins > Add New > Upload Plugin**.
2. Activate **Timed Event Block** in **Plugins**.
3. Open the Site Editor or Post Editor.
4. Insert the **Timed Event** block.
5. Configure start date/time, duration, and visibility behavior.

== Frequently Asked Questions ==

= Can I use Event Date, Event Time, or Event Countdown outside Timed Event? =
No. These child blocks are restricted to Timed Event context by design.

= Can I place media and embeds inside Timed Event? =
Yes. The parent block supports flexible inner content and is not limited to a narrow block whitelist.

= Which timezone is used for state and rendering? =
WordPress site timezone (`Settings > General`) is used on server-side rendering.

= Why does an ended event disappear? =
If `Hide when ended` is enabled on the parent block, ended events are not rendered on frontend.

= Does status update without refreshing the page? =
Yes for dynamic child outputs (Event Time and Event Countdown), via lightweight frontend scripts.

= Does this plugin support multilingual labels? =
Yes. Labels are user-editable, and static UI strings are prepared with WordPress i18n functions.

== Screenshots ==

1. Editor view with the Timed Event block and open start date/time picker in the block settings.
2. Frontend cinema schedule showing multiple event cards with active and countdown states.
3. Site Editor layout with a selected Timed Event item showing Scheduled status and countdown output.
4. Block sidebar settings for Timed Event, including start date/time, duration, and Hide when ended.
5. Frontend event list showing ended-state labels and final status text ("Screening Finished").

== Changelog ==

= 0.1.2 =
* Improved Event Countdown output by hiding exhausted leading units (days/hours/minutes) when they reach zero.
* Added editable `Prefix label` and `Suffix label` for countdown context text, rendered only while countdown is active.
* Added singular and plural unit labels for day/hour/minute/second with automatic unit selection based on value.
* Removed leading zero padding from countdown units for cleaner numeric output.

= 0.1.1 =
* Initial public release.
* Added Timed Event parent block with server-side scheduling logic.
* Added Event Date child block with site/custom date format.
* Added Event Time child block with dynamic scheduled/active/ended states.
* Added Event Countdown child block with start/end targets and dynamic updates.
* Added native style support for spacing, color, typography, border, and dimensions.

== Upgrade Notice ==

= 0.1.2 =
Improves Event Countdown text rendering with prefix/suffix labels, singular/plural unit labels, hidden exhausted leading units, and no leading zero padding.

= 0.1.1 =
This release includes the approved wp.org review adjustments and the initial public release metadata alignment.

= 0.1.0 =
Initial release of Timed Event Block.
