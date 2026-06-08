This is project 4 in phase 0. Its a simple Node CLI tool which runs in terminal instead of browser.

It too uses the V8 Engine that google uses in browser, but browser restricts the js in a tab for security. Running the JS file in teriminal using Node provide more flexibility and access to file systems and opertaing systems.

We dont have access to browse API, window or DOM in terminal as we do in browser but we get few inbuilt libraries and can always import other using NPM.

How to run this file :

node Phase\ 0/04-Node_Cli_tool/wordCount.js text.txt

What's happening:
node run the file wordcount.js, we provide the path.
We pass text.txt as an argument which is caught by process.argv. It is an array.

That's all for this, Today is June 8 2026, see u next week , in Phase 1, where i actually start building interesting project.