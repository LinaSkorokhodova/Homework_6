const fs = require('fs').promises;
const path = require('path');

// 1. Планируем таймер 
setTimeout(() => console.log('setTimeout сработал (запланирован на 100мс)'), 100);

// 2. CPU-bound задача блокирует Event loop 
//CPU-bound блокирует Event Loop, так как выполняется синхронно в одном потоке.
// Пока цикл крутится, Node.js не может обработать таймеры или другие колбэки.

  function cpuTask() {
    let sum = 0;
    for (let i = 1; i <= 1_000_000_000; i++) {
        sum += i;
    }
    return sum;
}

console.time('CPU-bound');
cpuTask();
console.timeEnd('CPU-bound');

// 3. I/O-bound задача не блокирует Event loop
// I/O-bound не блокирует, потому что операции чтения/записи делегируются системному пулу потоков. 
// Event Loop продолжает работать, пока диск читает файлы.
console.time('I/O-bound');
const readTasks = [];
for (let i = 1; i <= 10; i++) {
    readTasks.push(fs.readFile(path.join(__dirname, 'test-files', `file_${i}.txt`), 'utf8'));
}

Promise.all(readTasks).then(() => {
    console.timeEnd('I/O-bound');
    console.log('Finished');
});