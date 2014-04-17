#include <node.h>
#include "engine.h"

using namespace v8;

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
}

engine::~engine() {}

void engine::Init() {
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
  return scope.Close(args.This());
}

Handle<Value> engine::get(const Arguments& args) {
  HandleScope scope;
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
