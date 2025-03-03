"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./globals.css");
const google_1 = require("next/font/google");
const inter = (0, google_1.Inter)({ subsets: ['latin'] });
exports.metadata = {
    title: 'FPL Analytics',
    description: 'Fantasy Premier League analytics and insights',
};
function RootLayout({ children, }) {
    return (<html lang="en" className="dark">
      <body className={`${inter.className} dark:bg-dark min-h-screen`}>
        {children}
      </body>
    </html>);
}
