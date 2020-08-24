const app = require("../app");
const chai = require("chai");
const chaiHttp = require("chai-http");
process.env.NODE_ENV = "test";

const { expect } = chai;
const originalLogFunction = console.log;
let output;

chai.use(chaiHttp);
describe("Test Entry", () => {
  let agent = chai.request.agent(app); //app uses sessions, we need to retain coookies

  it("Tests Server Working", (done) => {
    agent.get("/").end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.message).to.equals(
        "Welcome to Music Through The Decades"
      );
      done();
    });
  });
  it("Tests two valid decades", (done) => {
    agent.get("/compare/1990-2010").end((err, res) => {
      expect(res).to.have.status(200);
      //expect(res).to.have.cookie("type", "decade");
      //expect(res).to.redirectTo("/music");
      if (err) return done(err);
      done();
    });
  });

  it("Tests valid decade vs user", (done) => {
    agent.get("/compare/1990-6Months").end((err, res) => {
      expect(res).to.have.status(200);
      //expect(res).to.have.cookie("type", "user");
      //expect(res).to.redirectTo("/music");
      if (err) return done(err);
      done();
    });
  });
  it("Tests invalid second decade", (done) => {
    agent.get("/compare/1990-1920").end((err, res) => {
      expect(res).to.have.status(400);
      expect(res.body.error).to.equals(
        "invalid value entered for 2nd comparator"
      );
      done();
    });
  });

  it("Tests invalid first decade", (done) => {
    agent.get("/compare/1920-2000").end((err, res) => {
      expect(res).to.have.status(400);
      expect(res.body.error).to.equals(
        "invalid value entered for 1st comparator"
      );
      done();
    });
  });

  it("Tests invalid user time range", (done) => {
    agent.get("/compare/1970-lastWeek").end((err, res) => {
      expect(res).to.have.status(400);
      expect(res.body.error).to.equals(
        "invalid value entered for 2nd comparator"
      );
      done();
    });
  });

  it("Inserts user time range as first comparator", (done) => {
    agent.get("/compare/allTime-1980").end((err, res) => {
      expect(res).to.have.status(400);
      expect(res.body.error).to.equals(
        "invalid value entered for 1st comparator"
      );
      done();
    });
  });
});
