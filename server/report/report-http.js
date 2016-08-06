import CoverageData from '../services/coverage-data'
import Conf from '../context/conf'
import Core from '../services/core'
const IstanbulApi = Npm.require('istanbul-api');
const Report = IstanbulApi.libReport;
const ReportImpl = IstanbulApi.reportsImpl;

export default class {
    constructor(res, options) {
        this.res = res;
        this.filepath = "";
        this.options = options;
        this.options.prefix = "/coverage/";
        this.opts = this.createOpts();
    }

    createOpts() {
        const prefix = this.options.prefix;
        return {
            verbose: Conf.IS_COVERAGE_VERBOSE,
            linkMapper: {
                getPath: function (node) {
                    if (typeof node === 'string') {
                        return node;
                    }
                    return node.getQualifiedName();
                },
                relativePath: function (source, target) {
                    return prefix + "show?p=" + this.getPath(target);
                },
                assetPath: function (node, name) {
                    return prefix + "asset/" + name;
                }
            }
        };
    }

    generate() {
        var coverage = Core.getCoverageObject();
        if (!(coverage && Object.keys(coverage).length > 0)) {
            this.res.setHeader('Content-type', 'text/plain');
            return this.res.end('No coverage information has been collected');
        }
        this.res.setHeader('Content-type', 'text/html');
        this.alterFS(this.res);
        var context = this.getContext(this.res);
        var report = ReportImpl.create('html', this.opts);
        if (this.options.filepath) {
            var child = CoverageData.getFileReport(coverage, this.options.filepath);
            report.onDetail(child, context);
        } else {
            var root = CoverageData.getTreeReport(coverage);
            report.onSummary(root, context);
        }
    }

    getContext(res) {
        var context = Report.createContext();
        Object.defineProperty(context, 'writer', {
            value: {
                writerForDir: {
                    writeFile: function () {
                        return res;
                    }
                },
                writeFile: function () {
                    return res;
                }
            }
        });
        return context;
    }

    // Istanbul-api expect to save HTML report to the file system and not over network
    alterFS(res) {
        res.close = function () {
            this.end();
        };
    }


}