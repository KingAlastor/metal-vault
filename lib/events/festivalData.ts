export async function getFestivalData() {
  const festivalData = [
    {
      name: "Festival 1",
      fromDate: "2022-08-01",
      toDate: "2022-08-05",
      desc: "Description of Festival 1",
      url: "https://example.com/festival1"
    },
    {
      name: "Festival 2",
      fromDate: "2022-09-10",
      toDate: "2022-09-15",
      desc: "Description of Festival 2",
      url: "https://example.com/festival2"
    },
    // Add more festival objects here...
  ];

  // Simulate an asynchronous operation
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return festivalData;
}