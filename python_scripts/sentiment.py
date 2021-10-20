import fcntl
import sys
import nltk.classify.util
from nltk.classify import NaiveBayesClassifier
from nltk.corpus import movie_reviews
from collections import defaultdict
import os.path
count = 1

def word_feats(words):
    return dict([(word, True) for word in words])

def word_feats_sentence(sentence):
	return word_feats(sentence.split(' '))

negids = movie_reviews.fileids('neg')
posids = movie_reviews.fileids('pos')

negfeats = [(word_feats(movie_reviews.words(fileids=[f])), 'neg') for f in negids]
posfeats = [(word_feats(movie_reviews.words(fileids=[f])), 'pos') for f in posids]

negcutoff = len(negfeats)*3/4
poscutoff = len(posfeats)*3/4

trainfeats = negfeats + posfeats
#trainfeats = negfeats[:negcutoff] + posfeats[:poscutoff]
#testfeats = negfeats[negcutoff:] + posfeats[poscutoff:]
#print 'train on %d instances, test on %d instances' % (len(trainfeats), len(testfeats))

classifier = NaiveBayesClassifier.train(trainfeats)
#print 'accuracy:', nltk.classify.util.accuracy(classifier, testfeats)
#classifier.show_most_informative_features()
dictionary_tweets = defaultdict(lambda:[0,0])
filep = open("check.txt", "w")
print>>filep, sys.argv[1] + sys.argv[2] + sys.argv[4] + "_" + str(count) + ".txt"
print>>filep, sys.argv[1] + sys.argv[2] + sys.argv[4] + "_" + str(count+1)+'.txt'
print>>filep, sys.argv[1] + sys.argv[3] + sys.argv[4] + "_" + "sentiment_" + str(count) + ".txt"
filep.close()

bufsize = 0
filePos = open(sys.argv[1] + sys.argv[4] +".pos", "w", bufsize)
fileNeg = open(sys.argv[1] + sys.argv[4] +".neg", "w", bufsize)


posCount = 0
negCount = 0

while True:
	filename = sys.argv[1] + sys.argv[2] + sys.argv[4] + "_" + str(count)
	while not os.path.isfile(sys.argv[1] + sys.argv[2] + sys.argv[4] + "_" + str(count+1)):
		continue
	f = open(filename,'r')

	#for sentence in f:
	#	print sentence + " " + classifier.classify(word_feats_sentence(sentence))
	fp = open(sys.argv[1] + sys.argv[3] + sys.argv[4] + "_" + "sentiment_" + str(count), "w")
	tweet_count = 0
	result = ""
	for line in f:
		word_parts = line.split("#")
		sentiment = classifier.classify(word_feats_sentence(line))
		#print >> fp, sentiment
		if (sentiment == "pos"):
			result+= "0 "
            		posCount+=1
			print >> filePos, posCount, ": " , line
		else:
			result+= "1 "
            		negCount+=1
			print >> fileNeg, negCount,": " , line


	print >> fp, result;
	fp.close()
	f.close()
	count += 1
