// Node 库
const fs = require("fs");
const path = require("path");
// 输出目录相对路径
const publishDirXd = "publish";
// 输出目录绝对路径
const publishDir = __dirname + path.sep + publishDirXd + path.sep;
// Markdown 解析
let MarkdownIt = require("markdown-it"),
	md = new MarkdownIt();

/**
 * 复制整文件夹方法
 * @param dir 需要删除的文件夹路径
 */

// 复制文件
const copyFile = function (srcPath, tarPath, cb) {
	var rs = fs.createReadStream(srcPath);
	rs.on("error", function (err) {
		if (err) {
			console.log("read error", srcPath);
		}
		cb && cb(err);
	});

	var ws = fs.createWriteStream(tarPath);
	ws.on("error", function (err) {
		if (err) {
			console.log("write error", tarPath);
		}
		cb && cb(err);
	});
	ws.on("close", function (ex) {
		cb && cb(ex);
	});

	rs.pipe(ws);
};

// 复制目录
var copyFolder = function (srcDir, tarDir, cb) {
	fs.readdir(srcDir, function (err, files) {
		var count = 0;
		var checkEnd = function () {
			++count == files.length && cb && cb();
		};

		if (err) {
			checkEnd();
			return;
		}

		files.forEach(function (file) {
			var srcPath = path.join(srcDir, file);
			var tarPath = path.join(tarDir, file);

			fs.stat(srcPath, function (err, stats) {
				if (stats.isDirectory()) {
					console.log("mkdir", tarPath);
					fs.mkdir(tarPath, function (err) {
						if (err) {
							return err;
						}

						copyFolder(srcPath, tarPath, checkEnd);
					});
				} else {
					copyFile(srcPath, tarPath, checkEnd);
				}
			});
		});
		//为空时直接回调
		files.length === 0 && cb && cb();
	});
};

/**
 * 扩展名一键更换方法
 * @param filepath 需要更改的文件夹路径
 */

function reExt(filepath) {
	console.log("Rename Target Path: " + filepath)
	fs.readdir(filepath, (err, files) => {
		if (err) {
			return err;
		}
		files.forEach((fn) => {
			let newFn = fn.replace(/.md/, ".html");
			fs.renameSync(filepath + fn, filepath + newFn);
		})
	})
}

/**
 * 渐进式文件夹删除方法
 * @param dir 需要删除的文件夹路径
 */

function rdir(dir) {
	var files = fs.readdirSync(dir) //同步读取文件夹内容

	files.forEach(function (item, index) { //forEach循环

		let p = path.resolve(dir, item) //读取第二层的绝对路径
		let pathstat = fs.statSync(p) //独读取第二层文件状态
		if (!pathstat.isDirectory()) { //判断是否是文件夹
			fs.unlinkSync(p) //不是文件夹就删除
		} else {
			rdir(p) //是文件夹就递归
		}


	})
	fs.rmdirSync(dir) //删除已经为空的文件夹
}

/**
 * 主函数
 */

function build() {
	if (fs.existsSync(publishDir)) {
		console.log("Have A Old Publish Folder.");
		rdir(publishDir);
		console.log("Delect Old Publish Folder Successful.");
		fs.mkdirSync(publishDir);
		console.log("Make A New Publish Folder Successful.");
	} else {
		console.log("Haven't A Old Publish Folder.");
		fs.mkdirSync(publishDir, true);
		console.log("Make A New Publish Folder Successful.");
	}
	console.log("Publish Dir Initialization Successful.");
	copyFolder(__dirname + path.sep + "source", publishDir, function (err) {
		if (err) {
			throw err;
		}
	});
	console.log("Copy File Successful.");
	fs.readdirSync(__dirname + path.sep + "note").forEach((name) => {
		console.log("Read Dir Successful.");
		fs.writeFileSync(publishDir + name, `<link rel="stylesheet" href="./css/yue.css">${md.render(fs.readFileSync(__dirname + path.sep + "note" + path.sep + name, "utf-8"))}`, {
			encoding: "utf8",
			flag: "w+"
		});
		console.log(
			"Copy A File From Note Folder To Publish,File Name Is " + name
		)
	});
	reExt(publishDir);
}

// 调用
build();