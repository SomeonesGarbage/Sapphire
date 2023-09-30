const con = require('./mysqlConnection')
const logger = require('./logger')

const util = require('util')

const query = util.promisify(con.query).bind(con)

function getPosts(community_id, limit, pid) {

    var limit = (limit) ? `LIMIT ${limit}` : '';
    const sql = `SELECT * FROM post WHERE community_id=${community_id} ORDER BY id DESC ${limit} `

    return new Promise((resolve, reject) => {
        con.query(sql, async (err, result, fields) => {
            if (err) { console.log(logger.Error(err)); reject(err) } else {

                for (let i = 0; i < result.length; i++) {
                    result[i].empathy_count = await query(`SELECT * FROM empathies WHERE post_id=${result[i].id}`)

                    if (JSON.stringify(result[i].empathy_count).search(String(pid)) !== -1) {
                        result[i].user_empathized = true
                    } else {
                        result[i].user_empathized = false
                    }
                }

                resolve(JSON.stringify(result))
            }
        })

    })
}

function getSinglePost(post_id, pid) {
    const sql = `SELECT * FROM post WHERE id=${post_id}`

    return new Promise((resolve, reject) => {
        con.query(sql, async (err, result, fields) => {
            if (err) { console.log(logger.Error(err)); reject(err) } else {

                for (let i = 0; i < result.length; i++) {
                    result[i].empathy_count = await query(`SELECT * FROM empathies WHERE post_id=${result[i].id}`)

                    if (JSON.stringify(result[i].empathy_count).search(String(pid)) !== -1) {
                        result[i].user_empathized = true
                    } else {
                        result[i].user_empathized = false
                    }
                }

                resolve(JSON.stringify(result))
            }
        })

    })
}

function getCommunities(key, limit) {

    var sql;
    var limit = (limit) ? `LIMIT ${limit}` : '';

    switch (key) {
        case 'newest':
            sql = `SELECT * FROM community WHERE hidden=0 ORDER BY created_at DESC ${limit}`
            break;

        case 'oldest':
            sql = `SELECT * FROM community WHERE hidden=0 ORDER BY created_at ASC ${limit}`
            break;

        case 'popular':
            sql = `SELECT * FROM community AS c WHERE hidden=0 
                ORDER BY 
                (SELECT COUNT(community_id) FROM post WHERE community_id=c.community_id)
                DESC ${limit}`
            break;

        case 'unpopular':
            sql = `SELECT * FROM community AS c WHERE hidden=0 ORDER BY (SELECT COUNT(community_id) FROM post WHERE community_id=c.community_id) ASC ${limit}`
            break;

        default:
            sql = `SELECT * FROM community WHERE hidden=0 ${limit}`
            break;
    }

    return new Promise((resolve, reject) => {
        con.query(sql, async (err, result, fields) => {
            if (err) { console.log(logger.Error(err)); reject(err) } else {

                for (let i = 0; i < result.length; i++) {
                    result[i].users = await query(`SELECT * FROM favorites WHERE community_id=${result[i].community_id}`)
                }

                resolve(JSON.stringify(result))
            }
        })
    })

}

function getCommunityData(community_id) {
    const sql = `SELECT * FROM community WHERE community_id=${community_id}`

    return new Promise((resolve, reject) => {
        con.query(sql, (err, result, fields) => {
            if (err) { console.log(logger.Error(err)); reject(err) } else {
                resolve(JSON.stringify(result))
            }
        })
    })
}

function getUserProfile(pid) {
    const sql = `SELECT * FROM account WHERE pid=${pid}`

    return new Promise((resolve, reject) => {
        con.query(sql, (err, result, fields) => {
            if (err) { console.log(logger.Error(err)); reject(err) } else {
                resolve(JSON.stringify(result))
            }
        })
    })
}

function getAllEmpathiesForPost(id) {
    const sql = `SELECT * FROM empathies WHERE post_id=${id}`

    return new Promise((resolve, reject) => {
        con.query(sql, (err, result, fields) => {
            if (err) { console.log(logger.Error(err)); reject(err) } else {
                resolve(JSON.stringify(result))
            }
        })
    })
}

function getAllUserProfileFromPostEmpathies(id) {
    const sql = `SELECT name, hash, pid, id, nnid, mii, bio FROM account WHERE pid IN (SELECT pid FROM empathies WHERE post_id=${id})`

    return new Promise((resolve, reject) => {
        con.query(sql, (err, result, fields) => {
            if (err) { console.log(logger.Error(err)); reject(err) } else {
                resolve(JSON.stringify(result))
            }
        })
    })
}

function getAllEmpathiesToUser(pid) {
    const sql = `SELECT * FROM empathies WHERE post_id IN (SELECT id FROM post WHERE pid=${pid})`

    return new Promise((resolve, reject) => {
        con.query(sql, (err, result, fields) => {
            if (err) { console.log(logger.Error(err)); reject(err) } else {
                resolve(JSON.stringify(result))
            }
        })
    })
}

function getAllPostsFromUser(pid, account_pid) {
    const sql = `SELECT * FROM post WHERE pid=${pid} ORDER BY created_at DESC`

    return new Promise((resolve, reject) => {
        con.query(sql, async (err, result, fields) => {
            if (err) { console.log(logger.Error(err)); reject(err) } else {

                for (let i = 0; i < result.length; i++) {
                    result[i].empathy_count = await query(`SELECT * FROM empathies WHERE post_id=${result[i].id}`)

                    if (JSON.stringify(result[i].empathy_count).search(String(account_pid)) !== -1) {
                        result[i].user_empathized = true
                    } else {
                        result[i].user_empathized = false
                    }
                }

                resolve(JSON.stringify(result))
            }
        })
    })
}

function isCommunityFavorited(community_id, pid) {
    const sql = `SELECT * FROM favorites WHERE community_id=${community_id} AND pid=${pid}`

    return new Promise((resolve, reject) => {
        con.query(sql, (err, result, fields) => {
            if (err) {reject(err); return;}

            if (result[0]) {
                resolve(true)
            } else {
                resolve(false)
            }
        })
    })
}

module.exports =
{
    getPosts,
    getSinglePost,
    getCommunities,
    getCommunityData,
    getUserProfile,
    getAllEmpathiesForPost,
    getAllUserProfileFromPostEmpathies,
    getAllEmpathiesToUser,
    getAllPostsFromUser,
    isCommunityFavorited
}