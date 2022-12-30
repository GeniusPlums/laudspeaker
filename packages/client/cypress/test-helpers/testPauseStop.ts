/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable jest/valid-expect */
// eslint-disable-next-line import/no-extraneous-dependencies
import "@4tw/cypress-drag-drop";
import credentials from "../fixtures/credentials.json";
import createNewSegment from "./createNewSegment";
import setupEventTrigger from "./setupEventTrigger";

const { email, password, userAPIkey, emailTemplate } =
  credentials.MessageHitUser;

export default () => {
  cy.wait(100);
  cy.get('[data-disclosure-link="Journey Builder"]').click();
  cy.wait(1000);
  cy.get("button").contains("Create Journey").click();
  cy.get("#name").should("exist").type("Pause and stop flow");
  cy.get("#createJourneySubmit").click();
  cy.wait(1000);
  cy.get("#audience").click();
  cy.get("#name").type("init");
  cy.get("#description").type("init description text");
  cy.get("#saveNewSegment").click();

  cy.get(".react-flow__viewport")
    .get('[data-isprimary="true"]')
    .move({ deltaX: 100, deltaY: 100 });

  cy.wait(1000);
  cy.get("#audience").click();
  cy.get("#name").type("slack audience");
  cy.get("#description").type("slack description");
  cy.get("#saveNewSegment").click();

  cy.get(".react-flow__viewport")
    .get('[data-isprimary="false"]')
    .move({ deltaX: 100, deltaY: 300 });

  cy.get('[data-isprimary="false"]').click();
  cy.get("#email > .p-0 > .justify-between").click();
  cy.get("#activeJourney").click();
  cy.contains(emailTemplate.name).click();
  cy.get("#exportSelectedTemplate").click();

  cy.get(".react-flow__viewport").get('[data-isprimary="true"]').click();
  setupEventTrigger("A", "A");

  cy.get('[data-isprimary="true"]')
    .get('[data-handlepos="bottom"]')
    .drag('[data-isprimary="false"] [data-handlepos="top"]', {
      force: true,
    });

  cy.get('[data-isprimary="false"] [data-handlepos="top"]').click();
  cy.get('[data-isprimary="false"]').click();

  setupEventTrigger("B", "B");

  cy.get('[data-isprimary="false"] [data-handlepos="bottom"]').drag(
    '[data-isprimary="true"] [data-handlepos="top"]',
    { force: true }
  );
  cy.get('[data-isprimary="true"] [data-handlepos="top"]').click();

  createNewSegment();

  cy.contains("Save").click();
  cy.wait(5000);
  cy.contains("Start").click();
  cy.wait(5000);
  cy.visit("/flow/Pause%20and%20stop%20flow/view");
  cy.url().should("contain", "/view");
  cy.wait(5000);
  cy.contains("Pause").click();
  cy.wait(5000);

  cy.request({
    method: "POST",
    url: `${Cypress.env("AxiosURL")}events`,
    headers: {
      Authorization: `Api-Key ${userAPIkey}`,
    },
    body: {
      correlationKey: "email",
      correlationValue: emailTemplate.correlationValue,
      event: { A: "A" },
    },
  }).then(({ body }) => {
    expect(body?.[0]?.jobIDs?.[0]).to.equal(undefined);
    cy.wait(5000);
    cy.contains("Resume").click();
    cy.wait(5000);
    cy.request({
      method: "POST",
      url: `${Cypress.env("AxiosURL")}events`,
      headers: {
        Authorization: `Api-Key ${userAPIkey}`,
      },
      body: {
        correlationKey: "email",
        correlationValue: emailTemplate.correlationValue,
        event: { A: "A" },
      },
    }).then(({ body }) => {
      cy.wait(5000);
      cy.request({
        method: "POST",
        headers: {
          Authorization: `Api-Key ${userAPIkey}`,
        },
        url: `${Cypress.env("AxiosURL")}events/job-status/email`,
        body: {
          jobId: body[0]?.jobIds?.[0],
        },
      }).then(({ body }) => {
        expect(body).to.equal("completed");
        cy.request({
          method: "POST",
          url: `${Cypress.env("AxiosURL")}events`,
          headers: {
            Authorization: `Api-Key ${userAPIkey}`,
          },
          body: {
            correlationKey: "email",
            correlationValue: emailTemplate.correlationValue,
            event: { B: "B" },
          },
        }).then(() => {
          cy.contains("Stop").click();
          cy.wait(5000);
          cy.contains("Yes").click();
          cy.wait(5000);
          cy.request({
            method: "POST",
            url: `${Cypress.env("AxiosURL")}events`,
            headers: {
              Authorization: `Api-Key ${userAPIkey}`,
            },
            body: {
              correlationKey: "email",
              correlationValue: emailTemplate.correlationValue,
              event: { A: "A" },
            },
          }).then(({ body }) => {
            expect(body?.[0]?.jobIDs?.[0]).to.equal(undefined);
          });
        });
      });
    });
  });
};