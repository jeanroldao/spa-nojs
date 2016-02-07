var express = require('express');
var status = require('http-status');
var wagner = require('wagner-core');

require('./models')(wagner);

var app = express();

app.use(function(req,res,next){setTimeout(next,1000)});

app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

var utils = require('./utils');
var bodyparser = require('body-parser');

var api = express.Router();

api.use(bodyparser.json());

app.use(bodyparser.urlencoded({     
  extended: true // to support URL-encoded bodies
})); 

api.get('/organization', wagner.invoke(function(Organization) {
  return function(req, res) {
    Organization.find({}, utils.handleMany(res));
  };
}));

api.get('/organization/:id', wagner.invoke(function(Organization) {
  return function(req, res) {
    Organization.findById(req.params.id, utils.handleOne(res));
  };
}));

api.post('/organization', wagner.invoke(function(Organization) {
  return function(req, res) {
    Organization.create(req.body, utils.handleOne(res));
  };
}));

api.put('/organization/:id', wagner.invoke(function(Organization) {
  return function(req, res) {
    Organization.findByIdAndUpdate(req.params.id, { $set: req.body }, { 'new': true, runValidators: true }, utils.handleOne(res));
  };
}));

api.delete('/organization/:id', wagner.invoke(function(Organization) {
  return function(req, res) {
    Organization.remove({ _id: req.params.id }, utils.handleOne(res));
  };
}));

api.get('/employee', wagner.invoke(function(Employee) {
  return function(req, res) {
    Employee.find({}).exec(utils.handleMany(res));
  };
}));

api.post('/employee', wagner.invoke(function(Employee) {
  return function(req, res) {
    Employee.create(req.body, utils.handleOne(res));
  };
}));

api.get('/employee/:id', wagner.invoke(function(Employee) {
  return function(req, res) {
    Employee.findById(req.params.id).exec(utils.handleOne(res));
  };
}));

api.get('/employee/organization/:id', wagner.invoke(function(Employee) {
  return function(req, res) {
    Employee.find({ organization: req.params.id }).exec(utils.handleOne(res));
  };
}));

api.put('/employee/:id', wagner.invoke(function(Employee) {
  return function(req, res) {
    Employee.findByIdAndUpdate(req.params.id, { $set: req.body }, { 'new': true, runValidators: true }, utils.handleOne(res));
  };
}));

api.delete('/employee/:id', wagner.invoke(function(Employee) {
  return function(req, res) {
    Employee.remove({ _id: req.params.id }, utils.handleOne(res));
  };
}));

app.use('/api/v1', api);

app.get('/nojs', wagner.invoke(function(Organization) {
  return function(req, res) {
    Organization.find({}, function(err, organizations) {
      if (err) {
        res.send(err)
      } else {
        //res.send(JSON.stringify(organizations));
        res.render('index.html', { organizations: organizations});
      }
    });
  };
}));

app.get('/nojs/delete/:id', wagner.invoke(function(Organization) {
  return function(req, res) {
    Organization.remove({ _id: req.params.id }, function(err) {
      res.redirect('/nojs#home');
    });
  };
}));

app.post('/nojs', wagner.invoke(function(Organization) {
  return function(req, res) {
    if (req.body.type == 'organization') {
      if (req.body._id == 'new') {
        Organization.create({ name: req.body.name }, function(err) {
          res.redirect('/nojs#home');
        });
      } else {
        Organization.findByIdAndUpdate(req.body._id, { 
          $set: { 
            name: req.body.name 
          } 
        }, { 
          'new': true, 
          runValidators: true 
        }, function(err) {
          res.redirect('/nojs#home');
        });
      }
    }
  };
}));


app.use(express.static('static'));

app.get('*', function (req, res) {
    res.status(status.NOT_FOUND).json({ error: 'Not found' });
});

app.get('*', function (req, res) {
    res.sendFile(__dirname + '/static/index.html');
});

app.disable('etag');

app.listen(3000);
console.log('Server listening on port 3000');