var tags = {'soda': 5, 'php': 2, 'java': 3, 'c': 9}

for (let i in tags) {
  // console.log(i, tags[i])
}

var p1 = function () {
  return new Promise((res, rej) => {
    setTimeout(function () {
      res('hello world')
      // rej("error happened")
    }, 100)
  })
}

p1().then(res => {
  console.log(res)
}).catch(rej => {
  console.error(rej)
})


if(/^[0-9A-Za-z~!@#$%^&*()]{6,16}$/.test('12abcd*^()%!~')) {
  console.log('success')
}else {
  console.log('failed')
}

console.log('windows7 windows2000 windows95'.match(/windows(?=95|2000)/g))

