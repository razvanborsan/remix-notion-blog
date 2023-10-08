import styles from "~/tailwind.css";

import { cssBundleHref } from "@remix-run/css-bundle";
import { json, type LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import Header from "~/components/header";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export async function loader() {
  return json({
    fontsUrl: process.env.ADOBE_FONTS_URL,
  });
}

export default function App() {
  const { fontsUrl } = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href={fontsUrl}></link>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-white flex flex-col justify-center items-center">
        <div className="xl:w-[1080px]">
          <Header />
          <div className="flex flex-col justify-center items-center">
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </div>
        </div>
      </body>
    </html>
  );
}
