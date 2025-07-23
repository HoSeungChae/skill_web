import {
  Form,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
  useLocation,
} from "@remix-run/react";

import { useEffect, useState } from "react";
import {
  redirect,
  type LoaderFunctionArgs,
  type LinksFunction,
} from "@remix-run/node";
import { createEmptyContact, getContacts } from "./data";

import appStylesHref from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

// 로그인/회원가입 경로 감지
function isLoginPath(pathname: string) {
  return pathname.startsWith("/login") ||
  pathname.startsWith("/register") ||
  pathname.startsWith("/find-pw")
  ;
}

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts, q };
};

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const location = useLocation();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  const hideSidebar = isLoginPath(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {!hideSidebar && (
          <button
            onClick={toggleSidebar}
            style={{
              position: "fixed",
              top: "1.5rem",
              left: "1rem",
              zIndex: 1000,
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              width: "45px"
            }}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        )}

        {!hideSidebar && sidebarOpen && (
          <div id="sidebar"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "320px",
              background: "#f0f0f0",
              padding: "1rem",
              overflowY: "auto",
              zIndex: 999,
              }}>
            <h1>Remix Contacts</h1>
            <div>
              <Form
                id="search-form"
                role="search"
                onChange={(event) => {
                  const isFirstSearch = q === null;
                  submit(event.currentTarget, {
                    replace: !isFirstSearch,
                  });
                }}
              >
                <input
                  id="q"
                  aria-label="Search contacts"
                  className={searching ? "loading" : ""}
                  defaultValue={q || ""}
                  placeholder="Search"
                  type="search"
                  name="q"
                  style={{marginLeft: "2rem", width: "150px"}}
                />
                <div id="search-spinner" hidden={!searching} />
              </Form>
              <Form method="post">
                <button type="submit"
                style={{marginLeft: "0.3rem"}}>New</button>
              </Form>
            </div>
            <nav>
              {contacts.length ? (
                <ul>
                  {contacts.map((contact) => (
                    <li key={contact.id}>
                      <NavLink
                        className={({ isActive, isPending }) =>
                          isActive
                            ? "active"
                            : isPending
                            ? "pending"
                            : ""
                        }
                        to={`contacts/${contact.id}`}
                        onClick={() => setSidebarOpen(false)} // 클릭하면 닫힘
                      >
                        <Link to={`contacts/${contact.id}`}>
                          {contact.first || contact.last ? (
                            <>
                              {contact.first} {contact.last}
                            </>
                          ) : (
                            <i>No Name</i>
                          )}{" "}
                          {contact.favorite ? <span>★</span> : null}
                        </Link>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  <i>No contacts</i>
                </p>
              )}
            </nav>
          </div>
        )}

        <div
          id="detail"
          className={
            navigation.state === "loading" && !searching ? "loading" : ""
          }
          style={{
            marginLeft: !hideSidebar && sidebarOpen ? "260px" : "0",
            transition: "margin-left 0.3s",
          }}
        >
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
