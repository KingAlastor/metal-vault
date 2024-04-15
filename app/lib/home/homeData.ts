
export async function getPostData() {
  return [
    {
      datetime: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
      username: "JohnDoe",
      postContent: "Hello, world!"
    },
    {
      datetime: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
      username: "JaneSmith",
      postContent: "I love coding!"
    },
    {
      datetime: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
      username: "AliceJohnson",
      postContent: "Just finished a great project! https://www.youtube.com/watch?v=55OJ17cHeJA"
    },
    {
      datetime: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
      username: "BobWilliams",
      postContent: "Excited for the weekend!"
    },
    {
      datetime: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
      username: "EmilyDavis",
      postContent: "Learning something new every day!"
    }
  ];
}
