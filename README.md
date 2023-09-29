# SQLizer-back

## Description
The project consists on a visual cooperative SQL Editor and helper of versionning

Project has been made by :
- Gabriel Séron
- Valentin Sejourne
- Robin Pinon
- Nicolas Triau
- Kilian Maréchal
- Killian Flohic
- Edouard Einsenfisz

MT5 End of year project

## Getting Started

Install the dependancies:
```bash
npm install
```

Starting docker:
```bash
npm run db:start
```

Run the development server:
```bash
npm run watch
```

## CONTRIBUTING

Rules to follow in order to contribute to the project

### How to submit changes

To submit changes you need to create a branch from Pré-Prod where you will be able to work on your feature or fix. When you’re done, you will have to create a pull request. Once reviewed, your branch may be merged in Pré-Prod. See the PR and commit standards as well to keep the git clean

### PR and commit standards

#### Name of the branch

Your branch must be created from Pre-Prod using the following syntax :

- If it’s a new feature :
** Ft/Name-of-the-feature **

- If it’s a bug fix :
** Fx/Name-of-the-fix **

#### Commit standards

Your commit message always have to have the following nomenclature:

> “[type]: your commit message”

The different types are:

- Feature
- Update
- Fix
- Remove
- Refacto
- Doc

**For example: “Update: Change selection of canvas elements”**

#### Pull Requests

PR without commentaries in the code or without description can be refused.

#### Name

- Name of your branch + main infos if necessary

If the branch as mainy features added

- Name of the main feature + precise that there is other minors features

#### Description

- Bullet points divided in categories (bugs / features / add / delete...)
- Each bullet point must represent a feature
- If necessary, add bullet points poiting notarious changements in the code
