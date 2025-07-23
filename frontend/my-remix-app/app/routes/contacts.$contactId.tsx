import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { FunctionComponent } from "react";
import invariant from "tiny-invariant";
import { getContact, updateContact } from "../data";

// ContactRecord 타입 정의 (실제 프로젝트에서는 app/types/contact.ts로 분리 권장)
interface ContactRecord {
  id: string;
  first?: string;
  last?: string;
  avatar?: string;
  twitter?: string;
  notes?: string;
  favorite?: boolean;
  upper_department?: string;
  lower_department?: string;
  position?: string;
  gender?: string;
  birth?: string;
  description?: string;
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return { contact } as { contact: ContactRecord };
};

const positionMap: Record<string, string> = {
  staff: "사원",
  assistant_manager: "주임",
  manager: "대리",
  senior_manager: "과장",
  deputy_general_manager: "차장",
  general_manager: "부장",
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  return updateContact(params.contactId, {
    favorite: formData.get("favorite") === "true",
  });
};

export default function Contact() {
  const { contact } = useLoaderData<{ contact: ContactRecord }>();

  return (
    <div id="contact" style={{ display: "flex", gap: "20px" }}>
      <div>
        {contact.avatar && (
          <img
            alt={`${contact.first || ""} ${contact.last || ""} avatar`}
            key={contact.avatar}
            src={contact.avatar}
            style={{
              width: "250px",
              height: "250px",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        )}
        {contact.description && (
          <p
            style={{
              whiteSpace: "pre-wrap",
              marginTop: "40px",
              marginLeft: "30px",
              textAlign: "left",
              wordBreak: "break-word",
            }}
          >
            {contact.description}
          </p>
        )}
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter && (
          <p>
            <a href={`https://twitter.com/${contact.twitter}`}>{contact.twitter}</a>
          </p>
        )}
        <div style={{ display: "flex", gap: "2px", marginBottom: "2px" }}>
          {contact.upper_department && <p style={{ margin: 0 }}>{contact.upper_department}</p>}
          {contact.lower_department && <p style={{ margin: 0 }}>{contact.lower_department}</p>}
        </div>
        {contact.position && (
          <div>
            <span style={{ margin: 0, lineHeight: 1 }}>
              {positionMap[contact.position] || contact.position || "Unknown Position"}
            </span>
          </div>
        )}
        {contact.gender && <p style={{ margin: "1px 0" }}>{contact.gender}</p>}
        {contact.birth && <p style={{ margin: "2px 0" }}>{contact.birth}</p>}
        {contact.notes && <p style={{ margin: "2px 0" }}>{contact.notes}</p>}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm("Please confirm you want to delete this record.");
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

const Favorite: FunctionComponent<{
  contact: Pick<ContactRecord, "id" | "favorite">;
}> = ({ contact }) => {
  const fetcher = useFetcher();
  const favorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : contact.favorite ?? false;

  return (
    <fetcher.Form method="post" action={`/contacts/${contact.id}`}>
      <button
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
};