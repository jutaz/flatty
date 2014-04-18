#include <node.h>
#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#include <uv.h>
#include <memory>
#include "engine.h"

using namespace v8;

Handle<String> gen_random(const int len) {
  std::string str;
  static const char alphanum[] =
    "0123456789"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "abcdefghijklmnopqrstuvwxyz";
  for (int i = 0; i < len; ++i) {
      str[i] = alphanum[rand() % (sizeof(alphanum) - 1)];
  }
  return String::New(str.c_str());
}

Persistent<Function> engine::constructor;

engine::engine(const Arguments& args) {
  if(!args[0]->IsString()) {
    ThrowException(Exception::TypeError(String::New("File argument must be a String.")));
  } else if(args.Length() == 2 && !args[1]->IsObject()) {
    ThrowException(Exception::TypeError(String::New("Options argument must be an Object.")));
  } else if(args.Length() == 2) {
    engine::options = args[1]->ToObject();
  }
  engine::file = args[0]->ToString();
  engine::changes = 0;
}

engine::~engine() {}

void engine::Init() {
  srand(time(NULL)+time(NULL)/time(NULL));
  Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
  tpl->SetClassName(String::NewSymbol("engine"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);
  // Prototype
  tpl->PrototypeTemplate()->Set(String::NewSymbol("set"), FunctionTemplate::New(set)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("get"), FunctionTemplate::New(get)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("delete"), FunctionTemplate::New(del)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("update"), FunctionTemplate::New(update)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("option"), FunctionTemplate::New(option)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("onOptionChange"), FunctionTemplate::New(onOptionChange)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("findIndexed"), FunctionTemplate::New(findIndexed)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("findRecursive"), FunctionTemplate::New(findRecursive)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("index"), FunctionTemplate::New(index)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("save"), FunctionTemplate::New(save)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("ticker"), FunctionTemplate::New(ticker)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("log"), FunctionTemplate::New(log)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("buildIndex"), FunctionTemplate::New(buildIndex)->GetFunction());

  constructor = Persistent<Function>::New(tpl->GetFunction());
}

Handle<Value> engine::New(const Arguments& args) {
  HandleScope scope;

  if (args.IsConstructCall()) {
    engine* obj = new engine(args);
    obj->data = Object::New();
    obj->Wrap(args.This());
    return args.This();
  } else {
    Handle<Value> argv[2] = { args[0], args[1]};
    return scope.Close(constructor->NewInstance(args.Length(), argv));
  }
}

Handle<Value> engine::NewInstance(const Arguments& args) {
  HandleScope scope;
  Handle<Value> argv[2] = { args[0], args[1]};
  Local<Object> instance = constructor->NewInstance(args.Length(), argv);

  return scope.Close(instance);
}

Handle<Value> engine::set(const Arguments& args) {
  HandleScope scope;
  Local<Function> callback;
  Handle<Value> key;
  Handle<Object> data;
  if(args.Length() < 2) {
    ThrowException(String::New("Set requires at least 2 arguments."));
  }
  if(args.Length() == 2) {
    key = gen_random(16)->ToString();
    data = args[0]->ToObject();
    if(args[1]->IsFunction()) {
      callback = Local<Function>::Cast(args[1]);
    }
  } else {
    key = args[0]->ToString();
    data = args[1]->ToObject();
    if(args[2]->IsFunction()) {
      callback = Local<Function>::Cast(args[2]);
    }
  }
  engine* obj = Unwrap<engine>(args.This());
  // obj->data->Set(key, data);
  obj->changes++;
  if(callback->IsFunction()) {
    Handle<Value> argv[1] = {
      key
    };
    callback->Call(Context::GetCurrent()->Global(), 1, argv);
  }
  return scope.Close(Undefined());
}

Handle<Value> engine::get(const Arguments& args) {
  HandleScope scope;
  Local<Function> callback;
  Handle<String> key;
  if(args.Length() < 1) {
    return ThrowException(String::New("Get requires at least 1 argument."));
  }
  if(args.Length() == 2) {
    key = args[0]->ToString();
    if(args[1]->IsFunction()) {
      callback = Local<Function>::Cast(args[1]);
    }
  } else {
    key = String::New("");
    if(args[0]->IsFunction()) {
      callback = Local<Function>::Cast(args[0]);
    }
  }
  engine* obj = Unwrap<engine>(args.This());
  if(key->Length() == 0) {
    Local<Array> result = Array::New(1);
    for (uint32_t i = 0; i < 1; i++) {
      const Local<Value> value = obj->data->Get(String::New("tst"));
      result->Set(i, value);
    }
    std::cout << result->Length() << std::endl;
    if(callback->IsFunction()) {
      Handle<Value> argv[1] = {
        result
      };
      callback->Call(Context::GetCurrent()->Global(), 1, argv);
    }
  } else {
    if(obj->data->Has(key)) {
      if(callback->IsFunction()) {
        Handle<Value> argv[1] = {
          obj->data->Get(key)
        };
        callback->Call(Context::GetCurrent()->Global(), 1, argv);
      }
    } else {
      if(callback->IsFunction()) {
        Handle<Value> argv[1] = {
          Null()
        };
        callback->Call(Context::GetCurrent()->Global(), 1, argv);
      }
    }
  }
  return scope.Close(args.This());
}

Handle<Value> engine::del(const Arguments& args) {
  HandleScope scope;
  return scope.Close(args.This());
}

Handle<Value> engine::update(const Arguments& args) {
  HandleScope scope;
  return scope.Close(args.This());
}

Handle<Value> engine::option(const Arguments& args) {
  HandleScope scope;
  return scope.Close(args.This());
}

Handle<Value> engine::onOptionChange(const Arguments& args) {
  HandleScope scope;
  return scope.Close(args.This());
}

Handle<Value> engine::findIndexed(const Arguments& args) {
  HandleScope scope;
  return scope.Close(args.This());
}

Handle<Value> engine::findRecursive(const Arguments& args) {
  HandleScope scope;
  return scope.Close(args.This());
}

Handle<Value> engine::index(const Arguments& args) {
  HandleScope scope;
  return scope.Close(args.This());
}

Handle<Value> engine::save(const Arguments& args) {
  HandleScope scope;
  return scope.Close(args.This());
}

Handle<Value> engine::ticker(const Arguments& args) {
  HandleScope scope;
  return scope.Close(args.This());
}

Handle<Value> engine::log(const Arguments& args) {
  HandleScope scope;
  return scope.Close(args.This());
}

Handle<Value> engine::buildIndex(const Arguments& args) {
  HandleScope scope;
  return scope.Close(args.This());
}
