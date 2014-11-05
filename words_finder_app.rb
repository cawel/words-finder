require 'sinatra'
require 'json'

class WordsFinderApp < Sinatra::Base
  get '/' do
    haml :main
  end

  get '/dict_en' do
    content_type :json
    content = File.read('public/dict_en.txt')
    content.split(/\W+/).to_json
  end

end
