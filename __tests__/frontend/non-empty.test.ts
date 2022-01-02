import { stubEndpoints } from "../test-utils/stubEndpoints";

const stubs = stubEndpoints({
  listFolders: (successHandler) => {
    successHandler([]);
  },
  listSharedDrives: (successHandler) => {
    successHandler([]);
  },
  move: (successHandler, _, parameters) => {
    setTimeout(() => {
      if (parameters[4] === true) {
        successHandler({ status: "success", errors: [] });
      } else {
        successHandler({ status: "error", reason: "notEmpty" });
      }
    }, 100);
  },
});

it("works with non-empty destination folder", () => {
  cy.visit("http://localhost:8080");
  cy.contains("Shared drive mover");
  cy.contains("Continue").click();
  cy.contains("My Drive").click();
  cy.contains("Continue").click();
  cy.contains("My Drive").click();
  cy.contains("Continue").click();
  cy.contains('contents of the folder "My Drive" into the folder "My Drive"');
  cy.contains("Move").click();
  cy.contains("is moving");
  cy.contains("Destination not empty").should("be.visible");
  cy.contains("No").click();
  cy.contains("Continue").click();
  cy.contains("Move").click();
  cy.contains("is moving");
  cy.contains("Destination not empty").should("be.visible");
  cy.contains("Yes").click();
  cy.contains("Done!");
  cy.contains("Successfully moved").then(() => {
    expect(stubs.move).to.have.been.calledWith(
      "root",
      "root",
      true,
      false,
      true
    );
  });
});
