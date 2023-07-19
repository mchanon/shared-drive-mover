import { stubEndpoints } from "../test-utils/stubEndpoints";

const stubs = stubEndpoints({
  listFolders: (successHandler) => {
    successHandler({ status: "success", response: [] });
  },
  listSharedDrives: (successHandler) => {
    successHandler({ status: "success", response: [] });
  },
  move: (successHandler) => {
    setTimeout(() => {
      successHandler({ status: "success", response: { errors: [] } });
    }, 100);
  },
});

it("works with copy configuration", () => {
  cy.visit("http://localhost:8080");
  cy.contains("Shared drive mover");
  cy.contains("Copy comments").click();
  cy.contains("Continue").click();
  cy.contains("My Drive").click();
  cy.contains("Continue").click();
  cy.contains("My Drive").click();
  cy.contains("Continue").click();
  cy.contains('contents of the folder "My Drive" into the folder "My Drive"');
  cy.contains("Move").click();
  cy.contains("Done!");
  cy.contains("Successfully moved").then(() => {
    expect(stubs.move).to.have.been.calledOnceWith(
      "root",
      "root",
      false,
      true,
      false,
    );
  });
});

it("works with merge configuration", () => {
  cy.visit("http://localhost:8080");
  cy.contains("Shared drive mover");
  cy.contains("Copy comments").click();
  cy.contains("Continue").click();
  cy.contains("My Drive").click();
  cy.contains("Continue").click();
  cy.contains("My Drive").click();
  cy.contains("Continue").click();
  cy.contains('contents of the folder "My Drive" into the folder "My Drive"');
  cy.contains("Move").click();
  cy.contains("Done!");
  cy.contains("Successfully moved").then(() => {
    expect(stubs.move).to.have.been.calledOnceWith(
      "root",
      "root",
      false,
      true,
      false,
    );
  });
});
