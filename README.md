# DDO Audit

A real-time player population tracking project and live LFM viewer for Dungeons and Dragons Online.

## Tech Stack

- **React**: A JavaScript library for building user interfaces, used for the frontend of the application.

## Links:

- **Main website**: [https://www.ddoaudit.com](https://www.ddoaudit.com)
- **Backend repository**: [https://github.com/Clemeit/ddo-audit-service](https://github.com/Clemeit/ddo-audit-service)

## To-do:

- Removing a character from Registered characters should remove it from Verified characters
- Allow for removing a character verification
- Content layout shift should be reduced by using placeholders
- Stop using spacers to move bottom-of-page buttons
- Nav menu links go to fake pages
- Hitting back button on page 2 of registration doesn't go to page 1
- On mobile:
-   - There's no visual indication that a character has been registered (maybe automatically navigate back after clicking Add on mobile devices)
-   - text-align: justified doesn't look great for small paragraphs (at least on mobile it's very evident)
