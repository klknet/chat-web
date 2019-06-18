var tags = {'soda': 5, 'php': 2, 'java': 3, 'c': 9}

for (let i in tags) {
  // console.log(i, tags[i])
}

var p1 = function () {
  return new Promise((res, rej) => {
    setTimeout(function () {
      // res('hello world')
      rej("error happened")
    }, 3000)
  })
}

p1().then(res => {
  console.log(res)
}).catch(rej => {
  console.error(rej)
})
