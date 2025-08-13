  const today = new Date();
        const formattedDate = today.getFullYear() + '/' + 
                              (today.getMonth() + 1) + '/' + 
                              today.getDate() + '';
        document.getElementById("date").textContent = formattedDate;