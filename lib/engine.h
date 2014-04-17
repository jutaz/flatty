#ifndef ENGINE_H
#define ENGINE_H

#include <node.h>

class engine : public node::ObjectWrap {
 public:
  static void Init();
  static v8::Handle<v8::Value> NewInstance(const v8::Arguments& args);

 private:
  explicit engine(const v8::Arguments& args);
  ~engine();

  static v8::Handle<v8::Value> New(const v8::Arguments& args);
  static v8::Handle<v8::Value> set(const v8::Arguments& args);
  static v8::Handle<v8::Value> get(const v8::Arguments& args);
  static v8::Handle<v8::Value> del(const v8::Arguments& args);
  static v8::Handle<v8::Value> update(const v8::Arguments& args);
  static v8::Handle<v8::Value> option(const v8::Arguments& args);
  static v8::Handle<v8::Value> onOptionChange(const v8::Arguments& args);
  static v8::Handle<v8::Value> findIndexed(const v8::Arguments& args);
  static v8::Handle<v8::Value> findRecursive(const v8::Arguments& args);
  static v8::Handle<v8::Value> index(const v8::Arguments& args);
  static v8::Handle<v8::Value> save(const v8::Arguments& args);
  static v8::Handle<v8::Value> ticker(const v8::Arguments& args);
  static v8::Handle<v8::Value> log(const v8::Arguments& args);
  static v8::Handle<v8::Value> buildIndex(const v8::Arguments& args);
  static v8::Persistent<v8::Function> constructor;
  const v8::Arguments& args_;
};

#endif
