/***
 * @author HuaiyuGong
 * @description This code is to convert markdown to pdf
 */

const fs = require('fs'),
    mp = require('markdown-pdf'),
    through = require('through2'),
    path = require('path')
cheerio = require('cheerio');


const files = '../mds'
const resultFiles='../pdfs'


const preProcessHtml = (basePath) => {
    return function () {
        return through(function (chunk, encoding, callback) {
            var $ = cheerio.load(chunk);
            $('img[src]').each(function () {
                var imagePath = $(this).attr('src');
                imagePath = path.resolve(basePath, imagePath);
                $(this).attr('src', 'file://' + (process.platform === 'win32' ? '/' : '') + imagePath);
            });

            this.push($.html());
            callback();
        });
    }
};

let options = {
    // preProcessHtml: function () { return through() },
    preProcessHtml: preProcessHtml(files),
    cssPath: '../resume.css',
    remarkable: {
        preset: 'full',
        html: true
    },
}

const recureRead = (dir) => fs.readdir(dir, (err, childrenDir) => {
    if (err) {
        console.log(err);
    } else {
        childrenDir.forEach(name => {
            if (fs.lstatSync(`${dir}/${name}`).isDirectory()) {
                recureRead(`${dir}/${name}`)
            } else {
                if (name.split('.')[1] === 'md') {
                    fs.createReadStream(`${dir}/${name}`)
                        .pipe(mp(options))
                        .pipe(fs.createWriteStream(`${resultFiles}/${name.split('.')[0]}.pdf`));
                    console.log(`${name} done!`)
                }
            }
        })
    }
});

recureRead(files);
