# Contribution Guide

Thank you for your interest in contributing to **OmnAIView**!  
This guide outlines the workflow for submitting contributions.

## 1. Fork the Repository

1. Navigate to the [OmnAIView repository](https://github.com/AI-Gruppe/OmnAIView).
2. Click the **Fork** button (top right) to create your own copy of the repository.

## 2. Clone Your Fork

Clone your fork to your local machine:

```sh
git clone git@github.com:AI-Gruppe/OmnAIView.git
cd OmnAIView
```

## 3. Create a Feature Branch

Before making changes, create a new branch:

```sh
git checkout -b feature/your-feature-name
```

Follow the naming convention:
- `feature/your-feature-name` for new features
- `fix/your-fix-description` for bug fixes
- `docs/update-readme` for documentation updates

## 4. Implement Your Changes

- Follow the project's coding standards.
- Ensure your code is properly formatted and linted.
- Write or update tests if applicable.

## 5. Commit Your Changes

Write meaningful commit messages:

```sh
git add .
git commit
```

It is expected that commits don't only have a header but also 
1. Why did you add/change something? 
2. What did you add/change in the commit? 
3. Possible important things to know about the commit.

## 6. Document your changes in the changelog 

To keep track of changes between different versions a changelog according to the (keepAChangelog)[https://keepachangelog.com/en/1.1.0/]
is used. 

It is expected that new changes are documented in this changelog. 

## 7. Push to Your Fork

Push your branch to your fork:

```sh
git push origin \<branchname\>
```

## 8. Open a Pull Request

1. Go to the original repository on GitHub.
2. Click **New Pull Request**.
3. Select your fork and branch.
4. Provide a **clear description** of your changes. Please follow our [pull request template](.github/PULL_REQUEST_TEMPLATE.md).
5. Submit the pull request.

## 9. Review & Approval

- PRs must be reviewed by at least **two maintainers**.
- Address requested changes by updating your branch and pushing updates.
- Once approved, the PR will be merged by one of the maintainers. 

## 10. Keep Your Fork Updated

To stay up to date with the latest changes: 

```sh
git checkout master 
git fetch upstream
git merge upstream/master
git push origin master
```

Make sure that you have added the upstream to your git repo with: 

```
git remote add upstream git@github.com:AI-Gruppe/OmnAIView.git
```

## 11. Reporting Issues

If you find a bug or have a feature request, please open an [issue](https://github.com/AI-Gruppe/OmnAIView/issues) and describe it clearly.

---

**Happy coding!** If you have any questions, feel free to ask in [Discussions](https://github.com/AI-Gruppe/OmnAIView/discussions).

