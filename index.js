'use strict'

var request = require("request-promise"),
    Q = require("q"),
    url = "http://challenge.broadly.com/classes";


var StudentsAverage = (function(){

    function getClasses(url) {
        return request({
            uri: url,
            json: true
        }).then(function(body) {
            return body.classes;
        })
    }

    function getStudentsInClass(classurl, studentslist) {
        return request({
            uri: classurl,
            json: true
        }).then(function(cls){
            var students = cls.students;

            return cls.next ? getStudentsInClass(cls.next, students) : students.concat(studentslist || []); 
        })
    }

    function filterByAge(age) {
        return function(students) {
            return students.filter(function(student) {
                return student.age >= age;
            });
        };    
    }

    function count(list) {
        return list.length;
    }


    return {
        getAverage: function(url){
            return getClasses(url)
                .then(function(classes){
                    return Q.all(
                        classes.map(function(cls){
                            return getStudentsInClass(cls).then(filterByAge(25)).then(count);
                        })
                    );
                })
                .then(function(numStudents) {
                    return numStudents.reduce(function(prev, curr) {
                        return prev + curr;
                    })/numStudents.length;
                }); 
        }
    };
})();

StudentsAverage.getAverage(url).then(function(avg){
    console.log("The average of students for each class is", avg);
});