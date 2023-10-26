const username = "heiume"; // Replace with your Github username
const accessToken = "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"; // Replace with your personal access token
const apiUrl = "https://api.github.com/graphql";

const query = `
  query {
    user(login: "${username}") {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

fetch(apiUrl, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query }),
})
  .then((response) => response.json())
  .then((data) => {
    const contributions = data.data.user.contributionsCollection.contributionCalendar;
    const weeks = contributions.weeks;

    // Create the table structure based on contributions data
    const contributionTable = document.getElementById("contribution-table");
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const row = document.createElement("tr");
      for (let weekIndex = 0; weekIndex < 53; weekIndex++) {
        const week = weeks[weekIndex];
        const contributionDay = week.contributionDays[dayOfWeek];
        const contributionCount = contributionDay ? contributionDay.contributionCount : 0;
        const td = document.createElement("td");
        let contributionColor;
        if (contributionCount < 5) {
          contributionColor = 0;
        } else if (contributionCount < 10) {
          contributionColor = 1;
        } else if (contributionCount < 15) {
          contributionColor = 2;
        } else if (contributionCount < 20) {
          contributionColor = 3;
        } else {
          contributionColor = 4;
        }
        td.className = `color-${contributionColor}`;
        row.appendChild(td);
      }
      contributionTable.appendChild(row);
    }
  })
  .catch((error) => {
    console.error("Error fetching GitHub contributions:", error);
  });