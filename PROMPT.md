Build a small web app where participants can:

1. Create an idea.
2. Browse ideas.
3. Join an idea/team.
4. Leave a team.
5. See team size and missing roles.
6. Comment briefly or add their contact info.
7. Admin can freeze team formation and export teams as CSV.

For 30 people, you do not need accounts with passwords. Use a simple participant “claim” flow:

* Participant enters name, email, role/skills.
* App gives them a private edit link or stores a participant ID in browser local storage.
* They can only join one team.
* Admin can manually clean mistakes.

That is much faster than authentication and good enough for a small hackathon.

Suggested tech stack

Use something Codex can generate cleanly in one shot:

Next.js + SQLite + Prisma + Tailwind

Why:

* Easy local deployment.
* SQLite is enough for 30 people.
* Prisma gives a clean schema.
* Next.js gives frontend and backend in one project.
* Can deploy to Vercel with a hosted DB later, or run locally.

For the simplest version, use:

* Next.js App Router
* TypeScript
* Tailwind CSS
* Prisma
* SQLite
* No login
* Admin protected by ADMIN_PASSWORD env var

Core data model

You need four main entities:

Participant

Fields:

* id
* name
* email
* skills
* interests
* contact
* createdAt

Idea

Fields:

* id
* title
* problem
* proposedSolution
* neededSkills
* maxTeamSize
* status: open, full, frozen
* creatorParticipantId
* createdAt

TeamMember

Fields:

* id
* ideaId
* participantId
* role
* motivation
* createdAt

Unique constraint:

* one participant can only be on one team

Comment

Optional, but useful:

* id
* ideaId
* participantId
* body
* createdAt

Pages to build

Minimum pages:

Page	Purpose
/	Idea/team board
/join	Register as participant
/ideas/new	Propose an idea
/ideas/[id]	View idea, team members, join button
/me	View/edit participant profile and current team
/admin	Freeze teams, export CSV, remove members

Team rules

For your case, I’d set:

* Max teams: 8
* Default max team size: 4
* Participants can join only one team
* Ideas can exist without full teams
* Joining closes automatically when team reaches max size
* Admin can freeze all teams before kickoff

This supports 30 people nicely: 8 teams gives average team size around 3–4.

One-shot Codex prompt

Paste this into Codex as the full task.

Build a small hackathon team-formation web app for a hackathon with around 30 participants and a maximum of 8 teams.

Use this stack:

* Next.js with App Router
* TypeScript
* Tailwind CSS
* Prisma
* SQLite for local development
* No external paid services
* No password-based user accounts
* Admin protected by an ADMIN_PASSWORD environment variable

The purpose of the app is to let participants propose ideas or join existing teams before the hackathon starts, so teams are already formed by kickoff.

Core requirements:

1. Participant registration

Create a /join page where a participant can register with:

* name
* email
* skills, comma-separated or free text
* interests, free text
* contact info, for example Discord, Slack, phone, or email

After registration, store their participant ID in local storage or a secure browser cookie so they can return to /me.

Do not implement full authentication. This is for a small internal hackathon.

2. Idea board

Create the home page / as a public board of proposed ideas.

Each idea card should show:

* idea title
* short problem summary
* needed skills
* current team size / max team size
* current members’ names
* status badge: Open, Full, or Frozen
* button/link to view details

Also include clear buttons for:

* “Register / Edit My Profile”
* “Propose an Idea”

3. Propose idea

Create /ideas/new.

Only registered participants can propose an idea. If no participant is found in local storage/cookie, redirect or show a link to /join.

Idea fields:

* title
* problem
* proposed solution
* needed skills
* max team size, default 4, minimum 2, maximum 6

When a participant proposes an idea, automatically add them as the first team member and mark them as “Idea owner”.

There must be a maximum of 8 active ideas/teams. If 8 ideas already exist, prevent creating another idea and show a friendly message saying the max number of teams has been reached and they should join an existing team.

4. Idea detail page

Create /ideas/[id].

Show:

* full idea details
* current team members
* needed skills
* current team size and max team size
* comments/discussion
* join team form
* leave team button if the current participant is on this team

Join team form should ask:

* what role they want to contribute
* short motivation or what they can help with

Rules:

* Participant must be registered before joining.
* Participant can join only one team at a time.
* Participant cannot join if the team is full.
* Participant cannot join if team formation is frozen.
* Participant cannot join if they are already on another team.
* Joining should update team status to Full when member count reaches maxTeamSize.
* Participant can leave their team unless team formation is frozen.

5. My profile page

Create /me.

Show the current participant profile, editable fields, and their current team if they have joined one.

Allow editing:

* name
* email
* skills
* interests
* contact info

Show a warning that profile data is lightweight and intended only for this hackathon.

6. Comments

On each idea detail page, allow registered participants to add short comments.

Comments should show:

* author name
* comment text
* timestamp

Keep comments simple. No nested replies.

7. Admin page

Create /admin.

Admin access should require entering the password from process.env.ADMIN_PASSWORD.

Admin should be able to:

* view all participants
* view all teams/ideas with members
* freeze or unfreeze team formation globally
* delete an idea
* remove a participant from a team
* export teams as CSV
* export participants as CSV

Store the global freeze setting in the database, for example in an AppSetting table with key teamFormationFrozen.

CSV export should include useful fields.

Teams CSV columns:

* idea title
* problem
* needed skills
* max team size
* member name
* member email
* member skills
* member contact
* team role
* motivation

Participants CSV columns:

* name
* email
* skills
* interests
* contact
* team title, if any

8. Database schema

Use Prisma models similar to:

* Participant
* Idea
* TeamMember
* Comment
* AppSetting

Important constraints:

* A participant can be in at most one team.
* Idea creator should be a participant.
* TeamMember should link participant and idea.
* Deleting an idea should delete team members and comments for that idea.
* Deleting a participant should delete comments and team membership or handle safely.

9. UX and styling

Use a clean, simple Tailwind UI.

Design goals:

* mobile-friendly
* obvious call-to-action buttons
* simple card layout
* no complicated navigation
* clear empty states
* friendly error messages
* accessible form labels

Suggested navigation:

* Board
* Propose Idea
* My Profile
* Admin

10. Validation

Implement server-side validation for all mutations.

Use simple validation rules:

* name required
* email required and must look like an email
* idea title required
* problem required
* max team size between 2 and 6
* comments limited to 500 characters
* role/motivation limited to reasonable lengths

11. Implementation style

Please create a complete working project.

Include:

* package.json scripts
* Prisma schema
* seed script with a few demo participants and ideas
* .env.example
* README with setup instructions

Setup should work with:

npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev

README should explain:

* how to start the app
* how to set ADMIN_PASSWORD
* how to reset the SQLite database
* how to export teams
* intended limitations of the app

12. Routes and server actions/API

Use either server actions or API routes, but keep the code simple and maintainable.

Make sure all mutations handle errors gracefully.

13. Final polish

Add helpful UI copy for participants, for example:

* “Propose an idea if you want to lead a team.”
* “Join a team if you like an existing idea.”
* “Teams are not final until the organizer freezes team formation.”
* “You can only join one team at a time.”

Make sure the app works end-to-end:

* register participant
* propose idea
* join idea
* leave idea
* comment
* admin freeze/unfreeze
* admin CSV export

Please implement the full app, not just pseudocode.

Add this if you want an even leaner MVP

If you want to reduce the risk of Codex overbuilding, add this at the end:

Prioritize a working MVP over fancy abstractions. Avoid unnecessary dependencies. Keep the UI simple. Do not add OAuth, email sending, real-time chat, payments, complex permissions, or integrations.
