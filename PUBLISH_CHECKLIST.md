# Publishing checklist

Do these in order. Steps 1 and 2 matter most, because Git keeps history.

## 1. Decide what to publish

Read "Choosing what to publish" in `compliance-transparency-index/README.md`.

- **Publish the compiled dataset (named banks):** do nothing.
- **Publish sample data only:** from inside the project folder, run
  ```bash
  cp src/data/banks.sample.js src/data/banks.js
  UPDATE_GOLDEN=1 npm test
  ```
  Do this before your first commit. Once pushed, the history keeps whatever you committed.

## 2. Fill in the placeholders

In `README.md`, replace `<your name>` (twice) and `<LinkedIn URL>`. Search the file for `<` to find them.

## 3. Check it runs

```bash
cd compliance-transparency-index
npm install        # also creates package-lock.json; commit it
npm test           # should report 24 passing
npm run dev        # open http://localhost:5173
```

## 4. Create the repository and push

On github.com, create a new **empty** repository named `compliance-transparency-index` (no README, no licence, no .gitignore). Then:

```bash
git init -b main
git add .
git commit -m "Initial commit: Compliance Transparency Index prototype"
git remote add origin https://github.com/<your-username>/compliance-transparency-index.git
git push -u origin main
```

With the GitHub CLI instead:

```bash
gh repo create compliance-transparency-index --public --source=. --push
```

**Your repository link is:** `https://github.com/<your-username>/compliance-transparency-index`

## 5. Optional: a live demo link

1. On GitHub: Settings, then Pages, then set **Source** to **GitHub Actions**.
2. Go to the Actions tab, choose **Deploy demo to GitHub Pages**, click **Run workflow**, and leave the dataset on `sample`.
3. When it finishes, the demo is at `https://<your-username>.github.io/compliance-transparency-index/`.

The deploy workflow is manual, so nothing goes live until you run it.

## 6. Polish the repository page

- Add a one-line description and topics, for example: `regtech`, `banking-compliance`, `rbi`, `india`, `react`, `transparency`.
- Pin the repository on your profile.
- Add a `LICENSE` file only when you decide how open you want it to be (see the README).
